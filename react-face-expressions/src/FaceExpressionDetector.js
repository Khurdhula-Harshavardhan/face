import React, { useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import './FaceExpressionDetector.css';

const FaceExpressionDetector = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        (async () => {
            console.log("Loading face-api models...");
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('/models');
            console.log("Models loaded successfully.");

            console.log("Setting up the webcam...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            videoRef.current.srcObject = stream;
            console.log("Webcam set up successfully.");

            videoRef.current.onloadeddata = async () => {
                console.log("Video data loaded, starting detection...");
                detectExpressions();
            };
        })();
    }, []);

    const detectExpressions = async () => {
        console.log("In detectExpressions...");

        const videoEl = videoRef.current;
        const displaySize = { width: videoEl.width, height: videoEl.height };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        setInterval(async () => {
            console.log("Detecting faces...");
            const detections = await faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
            if (detections && detections.length > 0) {
                console.log("Faces detected:", detections);
            } else {
                console.log("No faces detected.");
            }
            
            const canvasCtx = canvasRef.current.getContext('2d');
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);  // Clear the canvas

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
        }, 100);
    };

    return (
        <div className="container">
            <h1 className="title">Facial Expression Detector</h1>
            <p className='p'><small>CS 59000 Applications of Deep Learning, Course Presentation</small></p>
            <div className="video-canvas-wrapper">
                <video ref={videoRef} width="1080" height="560" autoPlay muted />
                <canvas ref={canvasRef} width="1080" height="560" />
            </div>
        </div>
    );
};

export default FaceExpressionDetector;
