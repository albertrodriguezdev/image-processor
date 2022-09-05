import React from 'react';
import './Main.css';

class Main extends React.Component {
  static originalFile;
  componentDidMount() {
    this.uploadButton.addEventListener('click', this.openDialogUpload);
    this.sldProcess.addEventListener('change', this.handleProcessImage);
    this.uploadInput.addEventListener('change', this.handleUploadImage);
    this.processButton.addEventListener('click', this.handleProcessImage);

  }

  componentWillUnmount() {
    this.uploadButton.removeEventListener('click', this.openDialogUpload);
    this.sldProcess.removeEventListener('change', this.handleProcessImage);
    this.uploadInput.removeEventListener('change', this.handleUploadImage);
    this.processButton.removeEventListener('click', this.handleProcessImage);
  }

  openDialogUpload = (event) => {
    this.uploadInput.click();
  }

  constructor(props) {
    super(props);

    this.state = {
      originalURL: '',
      processedURL: '',
      originalImgClass: 'originalImg',
      processedImgClass: 'processedImg',
      processButtonDisabled: true,
      errorTextContent: '',
      errorTextHidden: true,
      sldProcessHidden: true,
    };

    this.handleUploadImage = this.handleUploadImage.bind(this);
    this.handleProcessImage = this.handleProcessImage.bind(this);
  }
  /**
   * Upload the image save in uploadInput to the server.
   * 
   * @param {*} Event.
   */
  handleUploadImage(ev) {
    ev.preventDefault();
    this.setState({ errorTextHidden: true })

    // Check if there are files load into the uploadInput. 
    if (this.uploadInput.files.length > 0) {
      const data = new FormData();
      this.originalFile = this.uploadInput.files[0]

      // Check if extension is correct.
      if (this.validateExtension(this.originalFile.name)) {
        data.append('file', this.originalFile);

        fetch('/api/upload', {
          method: 'POST',
          body: data,
        },
          err => {            
            this.setState({ errorTextHidden: false });
            this.setState({ errorTextContent: 'Fatal error! Can\'t connect to the server.' })
          }
        ).then((response) => {
          response.json().then((body) => {
            this.setState({ processedImgClass: 'processedImg' })
            this.setState({ processedURL: `` })
            this.setState({ sldProcessHidden: true })
            this.setState({ originalURL: `${body.file}` })
            this.setState({ originalImgClass: 'img' })
            this.setState({ processButtonDisabled: false })
          },
            err => {
              this.setState({ errorTextHidden: false })
              this.setState({ errorTextContent: 'Fatal error! Can\'t connect to the server.' })
              this.uploadInput.value = ""
            });
        });
      } else {
        this.setState({ errorTextHidden: false })
        this.setState({ errorTextContent: 'Fatal error! Incorrect file extension.' })
        // Clean the uploadInput.
        this.uploadInput.value = ""
      }
    }
  }

  /**
   * Apply a filter to the original image.
   * 
   * @param {*} Event.
   */
  handleProcessImage(ev) {
    ev.preventDefault();
    this.setState({ errorTextHidden: true })
    const data = new FormData();
    data.append('file', this.originalFile);
    data.append('processValue', this.sldProcess.value);

    fetch('/api/process', {
      method: 'POST',
      body: data,
    },
      err => {
        this.setState({ errorTextHidden: false });
        this.setState({ errorTextContent: 'Fatal error! Can\'t connect to the server.' })
      }).then((response) => {
        response.json().then((body) => {
          this.setState({ processedURL: `${body.file}` })
          this.setState({ processedImgClass: 'img' })
          this.setState({ sldProcessHidden: false })
          this.setState({ processButtonDisabled: true })
        },
          err => {            
            this.setState({ errorTextHidden: false });
            this.setState({ errorTextContent: 'Fatal error! Can\'t connect to the server.' })
          });
      });
  }

  /**
   * 
   * @param {String} fileName The filename to check.
   * @returns 'true' if correct, 'false' if not.
   */
  validateExtension(fileName) {
    fileName = String(fileName)
    var dot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(dot, fileName.length).toLowerCase();
    if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png") {
      return false;
    } else {
      return true;
    }
  }



  render() {
    return (
      <div>
        <header className="App-header">
          <h1>Image Processor</h1>
        </header>
        <div className="wrapper">
          <div id="one">
            <h1>Original image</h1>
            <div className='container'>
              <img ref={elem => this.originalImg = elem} id="originalImg" className={this.state.originalImgClass} src={this.state.originalURL} alt="Snow" />
            </div>
          </div>
          <div id="two">
            <h1>Processed image</h1>
            <div className='container'>
              <img id="processImg" className={this.state.processedImgClass} src={this.state.processedURL} alt="Snow" />
            </div>
          </div>
          <div className="bottomContainer">
            <input ref={elem => this.sldProcess = elem} id='sldProcess' type="range" min="3" max="100" className="slider" hidden={this.state.sldProcessHidden} />
          </div>
          <div className='bottomContainer'>
            <input ref={elem => this.uploadInput = elem} id='uploadInput' type='file' accept="image/jpeg, image/png" hidden />
            <input ref={elem => this.uploadButton = elem} id='uploadButton' type="button" className='button' value="Upload the image" />
            <input ref={elem => this.processButton = elem} id='processButton' type="button" className='button' value="Process the image" disabled={this.state.processButtonDisabled} />
          </div>
          <p ref={elem => this.errorText = elem} id='processButton' className="errorText" hidden={this.state.errorTextHidden}>{this.state.errorTextContent}</p>
        </div>
      </div>
    );
  }
}

export default Main;