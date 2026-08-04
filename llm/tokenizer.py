from transformers import AutoTokenizer

print("Cargando tokenizer español...")

tokenizer = AutoTokenizer.from_pretrained(
    "flax-community/gpt-2-spanish"
)

print("Tokenizer cargado.")