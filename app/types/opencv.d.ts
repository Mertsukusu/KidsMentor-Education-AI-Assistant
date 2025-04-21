declare interface Window {
  cv: any;
}

declare namespace cv {
  class Mat {
    constructor();
    delete(): void;
  }
  
  class CascadeClassifier {
    constructor();
    load(path: string): boolean;
    detectMultiScale(image: Mat, objects: any, scaleFactor: number, minNeighbors: number, flags: number, minSize: any, maxSize: any): void;
    delete(): void;
  }
  
  namespace face {
    function LBPHFaceRecognizer_create(): any;
  }
} 