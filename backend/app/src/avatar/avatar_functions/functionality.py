import pytesseract
from PIL import Image
import io
from bson import ObjectId
import pdfplumber
import base64

def extract_text_from_image(db, current_user, file_id:str):
    """
    Analyzes an image and returns detected text.
    """
    # Assuming we want to extract text if there is any
    try:
        image_bytes = db['files'].find_one({"_id": ObjectId(file_id), "team_id": current_user["team_id"]})["fileData"]
        if not image_bytes:
            raise Exception("File not found")
        image_stream = io.BytesIO(image_bytes)
        
        # Open the image
        image = Image.open(image_stream)
        text = pytesseract.image_to_string(image)
        
        # If text is detected, return it
        if text.strip():
            return {"message": text}
        else:
            return {"message": "No text found. This may be a photo or abstract image."}
    except Exception as e:
        return {"message": f"Could not process image: {e}"}
    

def extract_text_with_from_pdf(file_id:str, db, current_user):
    """
    Extracts text from each page of a PDF using pdfplumber.

    Parameters:
    - file_id (str): Object id of the PDF file.

    Returns:
    - str: Combined text from all pages.
    """
    pdf_binary = db['files'].find_one({"_id": ObjectId(file_id), "team_id": current_user["team_id"]})["fileData"]
    if not pdf_binary:
        raise Exception("File not found")
    pdf_stream = io.BytesIO(pdf_binary)
    text = ""
    # Open the PDF from the BytesIO stream
    with pdfplumber.open(pdf_stream) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:  # Ensure there is text on the page
                text += page_text + "\n\n"  # Append text from each page
    
    return {'message': text}