from flask import Flask, request, jsonify
import uuid
from keybert import KeyBERT
#from pypdf import PdfWriter, PdfReader
from tika import parser
import fitz
import requests
from PyPDF2 import PdfReader

kw_model = KeyBERT()
API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
headers = {"Authorization": "Bearer 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"}

def get_info(path):
    with open(path, 'rb') as f:
        pdf = PdfReader(f)
        info = pdf.metadata
    author = info.author
    creator = info.creator
    producer = info.producer
    subject = info.subject
    title = info.title
    return title

def query(payload, min_length, max_length):
    # Adjust min_length and max_length for longer or shorter summaries
    payload["parameters"] = {"min_length": min_length, "max_length": max_length}
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World'

@app.route('/data', methods=['POST'])
def send_keywords():
    if 'pdf' not in request.files:
        return 'No PDF file uploaded', 400

    pdf_file = request.files['pdf']
    file_name = str(uuid.uuid4()) + ".pdf"
    pdf_file.save(file_name)
    get_info(file_name)
    with fitz.open(file_name) as doc:
        text = ""
        for page in doc:
            text += page.get_text()

    # Generate summaries of different lengths
    summ_text_400 = query({"inputs": text}, min_length=380, max_length=400)
    summ_text_600 = query({"inputs": text}, min_length=580, max_length=600)

    keywords = kw_model.extract_keywords(text)

    return {
        "data": {
            "title": get_info(file_name),
            "summary" : {"summary_400": summ_text_400,
            "summary_600": summ_text_600,},
            "keywords": keywords
        }
    }

if __name__ == '__main__':
    app.run(port=5000)
