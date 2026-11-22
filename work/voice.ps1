Add-Type -AssemblyName System.Speech
$s=New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice('Microsoft Huihui Desktop')
$s.Rate=3
$s.SetOutputToWaveFile((Join-Path (Get-Location) 'work/pika-syllables.wav'))
$s.Speak('皮卡')
$s.Dispose()
