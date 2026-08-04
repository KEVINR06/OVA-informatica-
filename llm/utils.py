import torch


def text_to_token_ids(text, tokenizer):

    encoded = tokenizer.encode(
        text,
        return_tensors="pt"
    )

    return encoded


def token_ids_to_text(token_ids, tokenizer):

    return tokenizer.decode(
        token_ids.squeeze(0),
        skip_special_tokens=True
    )

def extract_response(text, prompt):

    if prompt in text:
        text = text.replace(prompt, "")

    # Cortar si vuelve a aparecer una nueva instrucción
    if "### Instruction:" in text:
        text = text.split("### Instruction:")[0]

    if "### Response" in text:
        text = text.split("### Response")[0]

    return text.strip()