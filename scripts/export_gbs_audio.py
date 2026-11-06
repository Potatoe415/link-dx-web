import os
import shutil
import subprocess

os.makedirs('tmp_gbs', exist_ok=True)
files = [
    'ByteBufferPool.cs', 'Cartridge.cs', 'GameBoyCPU.cs',
    'GameBoyCPUInstructions.cs', 'GbsPlayer.cs', 'GeneralMemory.cs',
    'OPCycle.cs', 'OpLength.cs', 'Sound.cs'
]
for fn in files:
    txt = open(f'_ref_repo/GbsPlayer/{fn}', encoding='utf-8').read()
    txt = txt.replace('using Microsoft.Xna.Framework.Audio;', '')
    if fn == 'GameBoyCPU.cs':
        import re
        txt = re.sub(r'get\s*=>\s*([^;]+);', r'get { return \1; }', txt)
        txt = txt.replace('private byte flag_CBit => (byte)(flag_C ? 1 : 0);', 'private byte flag_CBit { get { return (byte)(flag_C ? 1 : 0); } }')
        txt = txt.replace('public byte data8 => _memory[reg_PC - 1];', 'public byte data8 { get { return _memory[reg_PC - 1]; } }')
        txt = txt.replace('public ushort data16 => (ushort)((_memory[reg_PC - 1] << 8) | _memory[reg_PC - 2]);', 'public ushort data16 { get { return (ushort)((_memory[reg_PC - 1] << 8) | _memory[reg_PC - 2]); } }')
    open(f'tmp_gbs/{fn}', 'w', encoding='utf-8').write(txt)

stub = """
using System;
using System.IO;

namespace GbsPlayer
{
    public enum SoundState { Stopped, Playing, Paused }

    public class CDynamicEffectInstance
    {
        public SoundState State = SoundState.Stopped;
        public MemoryStream PcmStream = new MemoryStream();

        public CDynamicEffectInstance(int sampleRate) { }
        public int GetPendingBufferCount() { return 0; }
        public void Play() { State = SoundState.Playing; }
        public void Pause() { State = SoundState.Paused; }
        public void Resume() { State = SoundState.Playing; }
        public void Stop() { State = SoundState.Stopped; }
        public void SetVolume(float volume) { }
        public void SubmitBuffer(byte[] buffer, int offset, int count)
        {
            PcmStream.Write(buffer, offset, count);
        }
    }

    public class Program
    {
        static void RenderTrack(byte trackNr, int seconds, string outPath)
        {
            var player = new GbsPlayer();
            player.LoadFile("_ref_repo/Data/Music/awakening.gbs");
            player.StartTrack(trackNr);
            player.SoundGenerator.SetStopTime(seconds);
            player.Play();
            player.Cpu.Update();
            byte[] pcm = player.SoundGenerator._soundOutput.PcmStream.ToArray();
            using (var fs = new FileStream(outPath, FileMode.Create))
            using (var bw = new BinaryWriter(fs))
            {
                bw.Write(new char[] { 'R', 'I', 'F', 'F' });
                bw.Write(36 + pcm.Length);
                bw.Write(new char[] { 'W', 'A', 'V', 'E' });
                bw.Write(new char[] { 'f', 'm', 't', ' ' });
                bw.Write(16);
                bw.Write((short)1);
                bw.Write((short)1);
                bw.Write(44100);
                bw.Write(44100 * 2);
                bw.Write((short)2);
                bw.Write((short)16);
                bw.Write(new char[] { 'd', 'a', 't', 'a' });
                bw.Write(pcm.Length);
                bw.Write(pcm);
            }
            Console.WriteLine("Wrote " + outPath + " (" + pcm.Length + " bytes)");
        }

        public static void Main(string[] args)
        {
            RenderTrack(28, 30, "public/assets/audio/music_indoor.wav");
            RenderTrack(3, 36, "public/assets/audio/music_outdoor.wav");
            RenderTrack(46, 24, "public/assets/audio/music_marin_sing.wav");
        }
    }
}
"""
open('tmp_gbs/Program.cs', 'w', encoding='utf-8').write(stub)

csc = r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
cs_files = [os.path.join('tmp_gbs', f) for f in os.listdir('tmp_gbs') if f.endswith('.cs')]
res = subprocess.run([csc, '/out:tmp_gbs/gbs2wav.exe'] + cs_files, capture_output=True, text=True)
print(res.stdout)
if res.returncode != 0:
    print('ERR:', res.stderr)
else:
    res2 = subprocess.run(['tmp_gbs/gbs2wav.exe'], capture_output=True, text=True)
    print(res2.stdout)
shutil.rmtree('tmp_gbs', ignore_errors=True)
