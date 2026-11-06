"""
Compiles the GbsPlayer emulator from _ref_repo/GbsPlayer/ with the .NET Framework csc and renders
awakening.gbs tracks to 44.1 kHz mono WAV in public/assets/audio/.
Song numbers come from musicOverworld.data (overworld zones), ObjMusic objects in each .map
(houses, caves, dungeons) and SetMusic(...) calls in _ref_repo/InGame (boss, owl, fanfares).
"""
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
            RenderTrack(28, 30, "public/assets/audio/music_indoor.wav"); // house interior (legacy)
            RenderTrack(3, 36, "public/assets/audio/music_outdoor.wav"); // Mabe Village (musicOverworld 3)
            RenderTrack(46, 24, "public/assets/audio/music_marin_sing.wav"); // Ballad of the Wind Fish (Marin)
            RenderTrack(4, 60, "public/assets/audio/music_overworld.wav"); // Koholint overworld with sword (musicOverworld 4)
            RenderTrack(8, 45, "public/assets/audio/music_forest.wav"); // Mysterious Forest (musicOverworld 8)
            RenderTrack(5, 45, "public/assets/audio/music_mountain.wav"); // Tal Tal Mountains (musicOverworld 5)
            RenderTrack(7, 40, "public/assets/audio/music_animal_village.wav"); // Animal Village (musicOverworld 7)
            RenderTrack(10, 40, "public/assets/audio/music_desert.wav"); // Yarna Desert (musicOverworld 10)
            RenderTrack(9, 30, "public/assets/audio/music_house.wav"); // houses: house1, house10.. (map music 9)
            RenderTrack(6, 30, "public/assets/audio/music_shop.wav"); // shop1/shop3 (map music 6)
            RenderTrack(1, 30, "public/assets/audio/music_minigame.wav"); // Trendy Game / photo house (map music 1)
            RenderTrack(37, 40, "public/assets/audio/music_cave.wav"); // caves (map music 37)
            RenderTrack(50, 30, "public/assets/audio/music_helphouse.wav"); // telephone booths (map music 50)
            RenderTrack(19, 60, "public/assets/audio/music_dungeon1.wav"); // Tail Cave (dungeon1.map)
            RenderTrack(20, 60, "public/assets/audio/music_dungeon2.wav"); // Bottle Grotto (dungeon2.map)
            RenderTrack(21, 60, "public/assets/audio/music_dungeon3.wav"); // Key Cavern (dungeon3_*.map)
            RenderTrack(22, 60, "public/assets/audio/music_dungeon4.wav"); // Angler Tunnel (dungeon4.map)
            RenderTrack(74, 60, "public/assets/audio/music_dungeon5.wav"); // Catfish Maw (dungeon5.map)
            RenderTrack(87, 60, "public/assets/audio/music_dungeon6.wav"); // Face Shrine (dungeon6.map)
            RenderTrack(90, 60, "public/assets/audio/music_dungeon7.wav"); // Eagle Tower (dungeon7_*.map)
            RenderTrack(89, 60, "public/assets/audio/music_dungeon8.wav"); // Turtle Rock (dungeon8.map)
            RenderTrack(96, 60, "public/assets/audio/music_dungeon_color.wav"); // Color Dungeon (dungeon_color.map)
            RenderTrack(32, 40, "public/assets/audio/music_sidescroll.wav"); // 2D side-scrolling passages (map music 32)
            RenderTrack(79, 45, "public/assets/audio/music_boss.wav"); // mini-boss / boss fight (SetMusic 79)
            RenderTrack(17, 45, "public/assets/audio/music_egg.wav"); // Wind Fish Egg (egg_*.map)
            RenderTrack(33, 20, "public/assets/audio/music_owl.wav"); // Owl appearance (ObjOwl)
            RenderTrack(14, 8, "public/assets/audio/music_sword_get.wav"); // sword fanfare (ObjLink sword1)
            RenderTrack(27, 10, "public/assets/audio/music_game_over.wav"); // respawn after game over (ObjLink.Respawn)
            RenderTrack(67, 120, "public/assets/audio/music_ending.wav"); // ending credits (EndingScreen)
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
    res2 = subprocess.run([os.path.abspath(os.path.join('tmp_gbs', 'gbs2wav.exe'))], capture_output=True, text=True)
    if res2.returncode != 0:
        print('ERR:', res2.stderr)
    print(res2.stdout)
shutil.rmtree('tmp_gbs', ignore_errors=True)

# Compress the long tracks: the 3 legacy WAVs stay as-is, every other track becomes Ogg Vorbis
# (~1/20 the size; supported by all evergreen browsers). Requires ffmpeg on PATH.
KEEP_WAV = {'music_indoor', 'music_outdoor', 'music_marin_sing'}
ffmpeg = shutil.which('ffmpeg')
for fn in sorted(os.listdir('public/assets/audio')):
    name, ext = os.path.splitext(fn)
    if ext != '.wav' or not name.startswith('music_') or name in KEEP_WAV:
        continue
    src = os.path.join('public/assets/audio', fn)
    if not ffmpeg:
        print('ffmpeg not found: leaving', src, 'uncompressed')
        continue
    dst = os.path.join('public/assets/audio', name + '.ogg')
    subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-i', src, '-c:a', 'libvorbis', '-q:a', '3', dst], check=True)
    os.remove(src)
    print('Encoded', dst)
