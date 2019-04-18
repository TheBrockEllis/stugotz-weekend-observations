const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var mediaStreamDestination = audioContext.createMediaStreamDestination();
// var merger = audioContext.createChannelMerger(2);

var beepBuffer;
var mediaRecorder;
var chunks = [];
var recordBtn = document.getElementById('recordBtn');
var stopBtn = document.getElementById('stopBtn');
var beepBtn = document.getElementById('beepBtn')
var soundClips = document.getElementById('soundClips');

window.addEventListener('load', function(){
  
  recordBtn.addEventListener('click', function(){
    console.log('starting recording');
    
    recordBtn.style.display = 'none';
    stopBtn.style.display = 'inline';

    mediaRecorder.start();
  });

  stopBtn.addEventListener('click', function(){
    
    recordBtn.style.display = 'inline';
    stopBtn.style.display = 'none';


    mediaRecorder.stop();
  });

  beepBtn.addEventListener('click', function(){
    var source = audioContext.createBufferSource(); // creates a sound source
    source.buffer = beepBuffer;
    
    // add this sound to the merger
    source.connect(mediaStreamDestination);

    // console.log('audioContext', audioContext);                   // tell the source which sound to play
    // source.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                                // play the source now
                                                    // note: on older systems, may have to use deprecated noteOn(time);
  });

  loadBeep();

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia({audio: true}).then(function (microphoneStream) {
      console.log('got media', microphoneStream);

      const micSource = audioContext.createMediaStreamSource(microphoneStream);
      micSource.connect(mediaStreamDestination);

      // console.log('assigned it to destination', destination);
      mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      // console.log('media recorder', mediaRecorder);

      mediaRecorder.ondataavailable = function (e) {
        console.log("DATA AVAILABLE", e.data);
        chunks.push(e.data);
      }

      mediaRecorder.onstop = function (e) {
        console.log("recorder stopped");

        var clipName = prompt('Enter a name for your sound clip');

        // var clipRow = document.createElement('article');
        // var clipLabel = document.createElement('p');
        // var audio = document.createElement('audio');
        // var deleteButton = document.createElement('button');

        // clipRow.classList.add('clip');
        // audio.setAttribute('controls', '');
        // deleteButton.innerHTML = "Delete";
        // clipLabel.innerHTML = clipName;

        // clipRow.appendChild(audio);
        // clipRow.appendChild(clipLabel);
        // clipRow.appendChild(deleteButton);
        // soundClips.appendChild(clipRow);

        var blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
        chunks = [];
        var audioURL = window.URL.createObjectURL(blob);
        // audio.src = audioURL;

        let audioTag = `<audio src=${audioURL} controls=''></audio>`;
        let clipLabel = `<p>${clipName}</p>`;
        let deleteBtn = `<button>Delete</button>`;

        soundClips.innerHTML += `
          <tr>
            <td>${clipLabel}</td>
            <td>${audioTag}</td>
            <td>${deleteBtn}</td>
          </tr>
        `;

        // deleteButton.onclick = function (e) {
        //   var evtTgt = e.target;
        //   evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        // }
      }
    })
    .catch(function (err) {
        console.log('The following getUserMedia error occured: ' + err);
    });
  } else {
    console.log('getUserMedia not supported on your browser!');
  }

});

function loadBeep() {
  var request = new XMLHttpRequest();
  request.open('GET', './beep.mp3', true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function () {
    audioContext.decodeAudioData(request.response, function (buffer) {
      beepBuffer = buffer;
    }, function(error){
      console.log("ERROR: ", error);
    });
  }
  request.send();
}