/* For controlling sound effects throughout the game. Sound effects' parameters were based off KittyKatAttack's examples from the sound.js tutorial [https://github.com/kittykatattack/sound.js] */
export default class GameController{

    //For buttons
    buttonSound(){

        soundEffect(
            600,       //frequency
            0,         //attack
            0.015,      //decay
            "square",  //waveform
            0.06,      //volume
            0,         //pan
            0          //wait before playing
        );

        soundEffect(
            900,       //frequency
            0,         //attack
            0.015,      //decay
            "square",  //waveform
            0.06,      //volume
            0,         //pan
            0.125          //wait before playing
        );

    }

    //For in-game character jumping
    jumpSound() {

        soundEffect(
          523.25,       //frequency
          0.05,         //attack
          0.2,          //decay
          "sine",       //waveform
          0.15,         //volume
          0.8,          //pan
          0,            //wait before playing
          600,          //pitch bend amount
          true,         //reverse
          100           //random pitch range
        );

    }

    //For in-game character collision
    deadSound() {

        soundEffect(
          100,         //frequency
          0,           //attack
          0.5,         //decay
          "triangle",  //waveform
          0.15,        //volume
          0,           //pan
          0,           //wait before playing
          0,           //pitch bend amount
          false,       //reverse
          0,           //random pitch range
          50           //dissonance
        );

    }

    //For in-game scoring
    scoringSound() {
        //A
        soundEffect(880, 0, 0.2, "square", 0.1, 0, 0.1);
        //High D
        soundEffect(1174.66, 0, 0.3, "square", 0.1, 0, 0.2);
    }

    //For count down counter
    counterSound() {
        //D
        soundEffect(587.33, 0, 0.4, "square", 0.1, 0, 0);
    }

    //For count down GO!
    goSound() {
        //High D
        soundEffect(1174.66, 0, 0.8, "square", 0.1, 0, 0);
    }

}

//------------------------------------------- KittyKatAttack's Sound.js --------------------------------------------------

/*
Sound.js
===============
A complete micro library of useful, modular functions that help you load, play, control
and generate sound effects and music for games and interactive applications. All the
code targets the WebAudio API.
*/


/*
Fixing the WebAudio API
--------------------------
The WebAudio API is so new that it's API is not consistently implemented properly across
all modern browsers. Thankfully, Chris Wilson's Audio Context Monkey Patch script
normalizes the API for maximum compatibility.
https://github.com/cwilso/AudioContext-MonkeyPatch/blob/gh-pages/AudioContextMonkeyPatch.js
It's included here.
Thank you, Chris!
*/

(function (global, exports, perf) {
    'use strict';
  
    function fixSetTarget(param) {
      if (!param)	// if NYI, just return
        return;
      if (!param.setTargetAtTime)
        param.setTargetAtTime = param.setTargetValueAtTime;
    }
  
    if (window.hasOwnProperty('webkitAudioContext') &&
        !window.hasOwnProperty('AudioContext')) {
      window.AudioContext = webkitAudioContext;
  
      if (!AudioContext.prototype.hasOwnProperty('createGain'))
        AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
      if (!AudioContext.prototype.hasOwnProperty('createDelay'))
        AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
      if (!AudioContext.prototype.hasOwnProperty('createScriptProcessor'))
        AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
      if (!AudioContext.prototype.hasOwnProperty('createPeriodicWave'))
        AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
  
  
      AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function() {
        var node = this.internal_createGain();
        fixSetTarget(node.gain);
        return node;
      };
  
      AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
      AudioContext.prototype.createDelay = function(maxDelayTime) {
        var node = maxDelayTime ? this.internal_createDelay(maxDelayTime) : this.internal_createDelay();
        fixSetTarget(node.delayTime);
        return node;
      };
  
      AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function() {
        var node = this.internal_createBufferSource();
        if (!node.start) {
          node.start = function ( when, offset, duration ) {
            if ( offset || duration )
              this.noteGrainOn( when || 0, offset, duration );
            else
              this.noteOn( when || 0 );
          };
        } else {
          node.internal_start = node.start;
          node.start = function( when, offset, duration ) {
            if( typeof duration !== 'undefined' )
              node.internal_start( when || 0, offset, duration );
            else
              node.internal_start( when || 0, offset || 0 );
          };
        }
        if (!node.stop) {
          node.stop = function ( when ) {
            this.noteOff( when || 0 );
          };
        } else {
          node.internal_stop = node.stop;
          node.stop = function( when ) {
            node.internal_stop( when || 0 );
          };
        }
        fixSetTarget(node.playbackRate);
        return node;
      };
  
      AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
      AudioContext.prototype.createDynamicsCompressor = function() {
        var node = this.internal_createDynamicsCompressor();
        fixSetTarget(node.threshold);
        fixSetTarget(node.knee);
        fixSetTarget(node.ratio);
        fixSetTarget(node.reduction);
        fixSetTarget(node.attack);
        fixSetTarget(node.release);
        return node;
      };
  
      AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter = function() {
        var node = this.internal_createBiquadFilter();
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        fixSetTarget(node.Q);
        fixSetTarget(node.gain);
        return node;
      };
  
      if (AudioContext.prototype.hasOwnProperty( 'createOscillator' )) {
        AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function() {
          var node = this.internal_createOscillator();
          if (!node.start) {
            node.start = function ( when ) {
              this.noteOn( when || 0 );
            };
          } else {
            node.internal_start = node.start;
            node.start = function ( when ) {
              node.internal_start( when || 0);
            };
          }
          if (!node.stop) {
            node.stop = function ( when ) {
              this.noteOff( when || 0 );
            };
          } else {
            node.internal_stop = node.stop;
            node.stop = function( when ) {
              node.internal_stop( when || 0 );
            };
          }
          if (!node.setPeriodicWave)
            node.setPeriodicWave = node.setWaveTable;
          fixSetTarget(node.frequency);
          fixSetTarget(node.detune);
          return node;
        };
      }
    }
  
    if (window.hasOwnProperty('webkitOfflineAudioContext') &&
        !window.hasOwnProperty('OfflineAudioContext')) {
      window.OfflineAudioContext = webkitOfflineAudioContext;
    }
  
  }(window));
  
  /*
  Define the audio context
  ------------------------
  All this code uses a single `AudioContext` If you want to use any of these functions
  independently of this file, make sure that have an `AudioContext` called `actx`. 
  */
  var actx = new AudioContext();

/*
  soundEffect
  -----------
  The `soundEffect` function let's you generate your sounds and musical notes from scratch
  (Reverb effect requires the `impulseResponse` function that you'll see further ahead in this file)
  To create a custom sound effect, define all the parameters that characterize your sound. Here's how to
  create a laser shooting sound:
      soundEffect(
        1046.5,           //frequency
        0,                //attack
        0.3,              //decay
        "sawtooth",       //waveform
        1,                //Volume
        -0.8,             //pan
        0,                //wait before playing
        1200,             //pitch bend amount
        false,            //reverse bend
        0,                //random pitch range
        25,               //dissonance
        [0.2, 0.2, 2000], //echo: [delay, feedback, filter]
        undefined         //reverb: [duration, decay, reverse?]
        3                 //Maximum duration of sound, in seconds
      );
  Experiment by changing these parameters to see what kinds of effects you can create, and build
  your own library of custom sound effects for games.
  */
  
 function soundEffect(
    frequencyValue,      //The sound's fequency pitch in Hertz
    attack,              //The time, in seconds, to fade the sound in
    decay,               //The time, in seconds, to fade the sound out
    type,                //waveform type: "sine", "triangle", "square", "sawtooth"
    volumeValue,         //The sound's maximum volume
    panValue,            //The speaker pan. left: -1, middle: 0, right: 1
    wait,                //The time, in seconds, to wait before playing the sound
    pitchBendAmount,     //The number of Hz in which to bend the sound's pitch down
    reverse,             //If `reverse` is true the pitch will bend up
    randomValue,         //A range, in Hz, within which to randomize the pitch
    dissonance,          //A value in Hz. It creates 2 dissonant frequencies above and below the target pitch
    echo,                //An array: [delayTimeInSeconds, feedbackTimeInSeconds, filterValueInHz]
    reverb,              //An array: [durationInSeconds, decayRateInSeconds, reverse]
    timeout              //A number, in seconds, which is the maximum duration for sound effects
  ) {
  
    //Set the default values
    if (frequencyValue === undefined) frequencyValue = 200;
    if (attack === undefined) attack = 0;
    if (decay === undefined) decay = 1;
    if (type === undefined) type = "sine";
    if (volumeValue === undefined) volumeValue = 1;
    if (panValue === undefined) panValue = 0;
    if (wait === undefined) wait = 0;
    if (pitchBendAmount === undefined) pitchBendAmount = 0;
    if (reverse === undefined) reverse = false;
    if (randomValue === undefined) randomValue = 0;
    if (dissonance === undefined) dissonance = 0;
    if (echo === undefined) echo = undefined;
    if (reverb === undefined) reverb = undefined;
    if (timeout === undefined) timeout = undefined;
  
    //Create an oscillator, gain and pan nodes, and connect them
    //together to the destination
    var oscillator, volume, pan;
    oscillator = actx.createOscillator();
    volume = actx.createGain();
    if (!actx.createStereoPanner) {
      pan = actx.createPanner();
    } else {
      pan = actx.createStereoPanner();
    }
    oscillator.connect(volume);
    volume.connect(pan);
    pan.connect(actx.destination);
  
    //Set the supplied values
    volume.gain.value = volumeValue;
    if (!actx.createStereoPanner) {
      pan.setPosition(panValue, 0, 1 - Math.abs(panValue));
    } else {
      pan.pan.value = panValue; 
    }
    oscillator.type = type;
  
    //Optionally randomize the pitch. If the `randomValue` is greater
    //than zero, a random pitch is selected that's within the range
    //specified by `frequencyValue`. The random pitch will be either
    //above or below the target frequency.
    var frequency;
    var randomInt = function(min, max){
      return Math.floor(Math.random() * (max - min + 1)) + min
    };
    if (randomValue > 0) {
      frequency = randomInt(
        frequencyValue - randomValue / 2,
        frequencyValue + randomValue / 2
      );
    } else {
      frequency = frequencyValue;
    }
    oscillator.frequency.value = frequency;
  
    //Apply effects
    if (attack > 0) fadeIn(volume);
    fadeOut(volume);
    if (pitchBendAmount > 0) pitchBend(oscillator);
    if (echo) addEcho(volume);
    if (reverb) addReverb(volume);
    if (dissonance > 0) addDissonance();
  
    //Play the sound
    play(oscillator);
  
    //The helper functions:
    
    function addReverb(volumeNode) {
      var convolver = actx.createConvolver();
      convolver.buffer = impulseResponse(reverb[0], reverb[1], reverb[2], actx);
      volumeNode.connect(convolver);
      convolver.connect(pan);
    }
  
    function addEcho(volumeNode) {
  
      //Create the nodes
      var feedback = actx.createGain(),
          delay = actx.createDelay(),
          filter = actx.createBiquadFilter();
  
      //Set their values (delay time, feedback time and filter frequency)
      delay.delayTime.value = echo[0];
      feedback.gain.value = echo[1];
      if (echo[2]) filter.frequency.value = echo[2];
  
      //Create the delay feedback loop, with
      //optional filtering
      delay.connect(feedback);
      if (echo[2]) {
        feedback.connect(filter);
        filter.connect(delay);
      } else {
        feedback.connect(delay);
      }
  
      //Connect the delay loop to the oscillator's volume
      //node, and then to the destination
      volumeNode.connect(delay);
  
      //Connect the delay loop to the main sound chain's
      //pan node, so that the echo effect is directed to
      //the correct speaker
      delay.connect(pan);
    }
  
    //The `fadeIn` function
    function fadeIn(volumeNode) {
  
      //Set the volume to 0 so that you can fade
      //in from silence
      volumeNode.gain.value = 0;
  
      volumeNode.gain.linearRampToValueAtTime(
        0, actx.currentTime + wait
      );
      volumeNode.gain.linearRampToValueAtTime(
        volumeValue, actx.currentTime + wait + attack
      );
    }
  
    //The `fadeOut` function
    function fadeOut(volumeNode) {
      volumeNode.gain.linearRampToValueAtTime(
        volumeValue, actx.currentTime + attack + wait
      );
      volumeNode.gain.linearRampToValueAtTime(
        0, actx.currentTime + wait + attack + decay
      );
    }
  
    //The `pitchBend` function
    function pitchBend(oscillatorNode) {
      //If `reverse` is true, make the note drop in frequency. Useful for
      //shooting sounds
  
      //Get the frequency of the current oscillator
      var frequency = oscillatorNode.frequency.value;
  
      //If `reverse` is true, make the sound drop in pitch
      if (!reverse) {
        oscillatorNode.frequency.linearRampToValueAtTime(
          frequency, 
          actx.currentTime + wait
        );
        oscillatorNode.frequency.linearRampToValueAtTime(
          frequency - pitchBendAmount, 
          actx.currentTime + wait + attack + decay
        );
      }
  
      //If `reverse` is false, make the note rise in pitch. Useful for
      //jumping sounds
      else {
        oscillatorNode.frequency.linearRampToValueAtTime(
          frequency, 
          actx.currentTime + wait
        );
        oscillatorNode.frequency.linearRampToValueAtTime(
          frequency + pitchBendAmount, 
          actx.currentTime + wait + attack + decay
        );
      }
    }
  
    //The `addDissonance` function
    function addDissonance() {
  
      //Create two more oscillators and gain nodes
      var d1 = actx.createOscillator(),
          d2 = actx.createOscillator(),
          d1Volume = actx.createGain(),
          d2Volume = actx.createGain();
  
      //Set the volume to the `volumeValue`
      d1Volume.gain.value = volumeValue;
      d2Volume.gain.value = volumeValue;
  
      //Connect the oscillators to the gain and destination nodes
      d1.connect(d1Volume);
      d1Volume.connect(actx.destination);
      d2.connect(d2Volume);
      d2Volume.connect(actx.destination);
  
      //Set the waveform to "sawtooth" for a harsh effect
      d1.type = "sawtooth";
      d2.type = "sawtooth";
  
      //Make the two oscillators play at frequencies above and
      //below the main sound's frequency. Use whatever value was
      //supplied by the `dissonance` argument
      d1.frequency.value = frequency + dissonance;
      d2.frequency.value = frequency - dissonance;
  
      //Fade in/out, pitch bend and play the oscillators
      //to match the main sound
      if (attack > 0) {
        fadeIn(d1Volume);
        fadeIn(d2Volume);
      }
      if (decay > 0) {
        fadeOut(d1Volume);
        fadeOut(d2Volume);
      }
      if (pitchBendAmount > 0) {
        pitchBend(d1);
        pitchBend(d2);
      }
      if (echo) {
        addEcho(d1Volume);
        addEcho(d2Volume);
      }
      if (reverb) {
        addReverb(d1Volume);
        addReverb(d2Volume);
      }
      play(d1);
      play(d2);
    }
  
    //The `play` function
    function play(node) {
      node.start(actx.currentTime + wait);
  
      //Oscillators have to be stopped otherwise they accumulate in 
      //memory and tax the CPU. They'll be stopped after a default
      //timeout of 2 seconds, which should be enough for most sound 
      //effects. Override this in the `soundEffect` parameters if you
      //need a longer sound
      node.stop(actx.currentTime + wait + 2);
    }
  }

  /*
impulseResponse
---------------
The `makeSound` and `soundEffect` functions uses `impulseResponse`  to help create an optional reverb effect.  
It simulates a model of sound reverberation in an acoustic space which 
a convolver node can blend with the source sound. Make sure to include this function along with `makeSound`
and `soundEffect` if you need to use the reverb feature.
*/

function impulseResponse(duration, decay, reverse, actx) {

    //The length of the buffer.
    var length = actx.sampleRate * duration;
  
    //Create an audio buffer (an empty sound container) to store the reverb effect.
    var impulse = actx.createBuffer(2, length, actx.sampleRate);
  
    //Use `getChannelData` to initialize empty arrays to store sound data for
    //the left and right channels.
    var left = impulse.getChannelData(0),
        right = impulse.getChannelData(1);
  
    //Loop through each sample-frame and fill the channel
    //data with random noise.
    for (var i = 0; i < length; i++){
  
      //Apply the reverse effect, if `reverse` is `true`.
      var n;
      if (reverse) {
        n = length - i;
      } else {
        n = i;
      }
  
      //Fill the left and right channels with random white noise which
      //decays exponentially.
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
  
    //Return the `impulse`.
    return impulse;
  }