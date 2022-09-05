import json
import logging
import os
import pathlib
import shutil
import time

import cv2
from PIL import Image
from flask import Flask, request, session
from flask_cors import CORS
from werkzeug.utils import secure_filename

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger('HELLO WORLD')

UPLOAD_URL = '/api/images'
UPLOAD_FOLDER = '.' + UPLOAD_URL
ORIGINAL_FOLDER = UPLOAD_FOLDER + '/original'
PROCESSED_FOLDER = UPLOAD_FOLDER + '/processed'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__, static_folder=UPLOAD_FOLDER, static_url_path=UPLOAD_URL)
app.secret_key = os.urandom(24)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/api/upload', methods=['POST'])
def file_upload():
    """
    Save a image.
    :return: The image path.
    """
    if os.path.isdir(ORIGINAL_FOLDER):
        shutil.rmtree(ORIGINAL_FOLDER, ignore_errors=False, onerror=None)
    if not os.path.isdir(ORIGINAL_FOLDER):
        os.makedirs(ORIGINAL_FOLDER)
    file = request.files['file']
    sec_filename = secure_filename(file.filename)
    extension = pathlib.Path(sec_filename).suffix

    # Add timestamp to the name to force page to reload image
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = 'original' + timestamp + extension
    destination = "/".join([ORIGINAL_FOLDER, filename])
    file.save(destination)
    session['uploadFilePath'] = destination
    json_ex = {
        "file": destination[1:],
    }

    # convert into JSON:
    response = json.dumps(json_ex)

    return response


@app.route('/api/process', methods=['POST'])
def file_process():
    """
    Process an image applying a filter and save it.
    :return: The image path.
    """
    if os.path.isdir(PROCESSED_FOLDER):
        shutil.rmtree(PROCESSED_FOLDER, ignore_errors=False, onerror=None)
    if not os.path.isdir(PROCESSED_FOLDER):
        os.makedirs(PROCESSED_FOLDER)
    file = request.files['file']
    sec_filename = secure_filename(file.filename)
    extension = pathlib.Path(sec_filename).suffix

    # Add timestamp to the name to force page to reload image
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = 'processed' + timestamp + extension
    destination = "/".join([PROCESSED_FOLDER, filename])
    file.save(destination)

    file = process_img(destination)
    file.save(destination)
    session['uploadFilePath'] = destination
    json_ex = {
        "file": destination[1:],
    }

    # convert into JSON:
    response = json.dumps(json_ex)

    return response


def process_img(destination):
    """
    Apply a filter to an image.
    :param destination: The path to the image.
    :return: The image processed with the filter.
    """
    if os.path.isfile(destination):
        img = None
        while img is None:
            img = cv2.imread(destination)
            if img is not None:
                img_fix = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                process_value = request.form['processValue']
                average = cv2.blur(img_fix, (int(process_value), int(process_value)))
                return Image.fromarray(average)
    else:
        return 0


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", use_reloader=False)

CORS(app, expose_headers='Authorization')
