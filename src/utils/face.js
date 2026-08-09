import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  console.log("Models Loaded ✅");
};

export const getFaceDescriptor = async (image) => {
  const detection = await faceapi
    .detectSingleFace(image)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return detection.descriptor;
};

export const compareFaces = (desc1, desc2) => {
  return faceapi.euclideanDistance(desc1, desc2);
};
