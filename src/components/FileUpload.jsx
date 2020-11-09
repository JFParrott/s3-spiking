import React from 'react';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';

class FileUpload extends React.Component {
  state = {
    file: null,
    thumbnailImage: {},
    fullsizeImage: {},
    imagesSent: false,
  };

  resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        'JPEG',
        80,
        0,
        (uri) => {
          resolve(uri);
        },
        'base64'
      );
    });

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  submitFile = (e) => {
    const { file } = this.state;
    e.preventDefault();
    try {
      if (!file) {
        throw new Error('Select a file first!');
      }
      this.resizeFile(file[0])
        .then((res) => {
          const newFile = this.dataURLtoFile(res, 'newImage.jpeg');
          const thumbnailForm = new FormData();
          thumbnailForm.append('file', newFile);
          const fullsizeForm = new FormData();
          fullsizeForm.append('file', file[0]);
          return Promise.all([
            axios.post(`http://localhost:9090/api/image`, thumbnailForm, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }),
            axios.post(`http://localhost:9090/api/image`, fullsizeForm, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }),
          ]);
        })
        .then(([thumbnail, fullsize]) => {
          this.setState({
            imagesSent: true,
            thumbnailImage: thumbnail,
            fullsizeImage: fullsize,
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  deletePhoto = () => {
    // const { thumbnailImage, fullsizeImage } = this.state;
    // console.log(thumbnailImage);
    // const thumbKey = thumbnailImage.data.key;
    // const fullsizeKey = fullsizeImage.data.key.split('/')[1];
    return axios
      .delete('http://localhost:9090/api/image/1604593310193.jpg')
      .catch((err) => {
        console.log(err);
      });
  };
  render() {
    const { imagesSent, thumbnailImage, fullsizeImage } = this.state;
    return (
      <>
        <form onSubmit={this.submitFile}>
          <label>Upload file</label>
          <input
            type="file"
            onChange={(event) => {
              this.setState({ file: event.target.files });
            }}
          />
          <button type="submit">Send</button>
        </form>
        <button onClick={this.deletePhoto}>Delete photo</button>
        {imagesSent && (
          <>
            {/* <img
              src={`https://jp-travel-photos.s3.eu-west-2.amazonaws.com/${thumbnailImage.data.key}`}
              alt={thumbnailImage.data.ETag}
            ></img>
            <img
              src={`https://jp-travel-photos.s3.eu-west-2.amazonaws.com/${fullsizeImage.data.key}`}
              alt={fullsizeImage.data.ETag}
            ></img> */}
          </>
        )}
      </>
    );
  }
}

export default FileUpload;
