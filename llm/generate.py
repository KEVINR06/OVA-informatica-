import torch

from llm.tokenizer import tokenizer
from llm.utils import text_to_token_ids, token_ids_to_text, extract_response


def generate(
    model,
    prompt,
    max_new_tokens=150,
    temperature=0.8,
    top_k=50,
):

    model.eval()

    # Prompt igual al utilizado durante el entrenamiento
    prompt = (
        "A continuación hay una instrucción que describe una tarea. "
        "Escribe una respuesta que complete adecuadamente la solicitud.\n\n"
        "### Instruction:\n"
        f"{prompt}\n\n"
        "### Response:\n"
    )

    idx = text_to_token_ids(prompt, tokenizer)

    with torch.no_grad():

        for _ in range(max_new_tokens):

            logits = model(idx)

            logits = logits[:, -1, :]

            # Temperatura
            logits = logits / temperature

            # Top-k
            if top_k is not None:

                values, _ = torch.topk(logits, top_k)

                logits[logits < values[:, [-1]]] = -float("Inf")

            probs = torch.softmax(logits, dim=-1)

            next_token = torch.multinomial(probs, num_samples=1)

            idx = torch.cat((idx, next_token), dim=1)

            # EOS GPT-2
            if next_token.item() == 50256:
                break

    text = token_ids_to_text(idx, tokenizer)

    response = extract_response(text, prompt)

    return response