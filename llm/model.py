import math
import torch
import torch.nn as nn


# ==========================================================
# Layer Normalization
# ==========================================================

class LayerNorm(nn.Module):
    def __init__(self, emb_dim):
        super().__init__()

        self.eps = 1e-5

        self.scale = nn.Parameter(torch.ones(emb_dim))
        self.shift = nn.Parameter(torch.zeros(emb_dim))

    def forward(self, x):

        mean = x.mean(dim=-1, keepdim=True)

        var = x.var(dim=-1, unbiased=False, keepdim=True)

        x = (x - mean) / torch.sqrt(var + self.eps)

        return self.scale * x + self.shift


# ==========================================================
# GELU
# ==========================================================

class GELU(nn.Module):

    def forward(self, x):

        return 0.5 * x * (
            1.0
            + torch.tanh(
                math.sqrt(2.0 / math.pi)
                * (x + 0.044715 * x.pow(3))
            )
        )


# ==========================================================
# Feed Forward Network
# ==========================================================

class FeedForward(nn.Module):

    def __init__(self, cfg):

        super().__init__()

        self.layers = nn.Sequential(

            nn.Linear(
                cfg.emb_dim,
                4 * cfg.emb_dim
            ),

            GELU(),

            nn.Linear(
                4 * cfg.emb_dim,
                cfg.emb_dim
            )
        )

    def forward(self, x):

        return self.layers(x)
    # ==========================================================
# Multi-Head Self Attention
# ==========================================================

class MultiHeadAttention(nn.Module):

    def __init__(self, cfg):

        super().__init__()

        assert cfg.emb_dim % cfg.n_heads == 0

        self.emb_dim = cfg.emb_dim
        self.n_heads = cfg.n_heads
        self.head_dim = cfg.emb_dim // cfg.n_heads

        self.W_query = nn.Linear(
            cfg.emb_dim,
            cfg.emb_dim,
            bias=cfg.qkv_bias
        )

        self.W_key = nn.Linear(
            cfg.emb_dim,
            cfg.emb_dim,
            bias=cfg.qkv_bias
        )

        self.W_value = nn.Linear(
            cfg.emb_dim,
            cfg.emb_dim,
            bias=cfg.qkv_bias
        )

        self.out_proj = nn.Linear(
            cfg.emb_dim,
            cfg.emb_dim
        )

        # Máscara causal
        mask = torch.triu(
            torch.ones(
                cfg.context_length,
                cfg.context_length
            ),
            diagonal=1
        )

        self.register_buffer(
            "mask",
            mask
        )

    def forward(self, x):

        B, T, C = x.shape

        queries = self.W_query(x)
        keys = self.W_key(x)
        values = self.W_value(x)

        queries = queries.view(
            B,
            T,
            self.n_heads,
            self.head_dim
        ).transpose(1, 2)

        keys = keys.view(
            B,
            T,
            self.n_heads,
            self.head_dim
        ).transpose(1, 2)

        values = values.view(
            B,
            T,
            self.n_heads,
            self.head_dim
        ).transpose(1, 2)

        scores = (
            queries @ keys.transpose(-2, -1)
        ) / math.sqrt(self.head_dim)

        causal_mask = self.mask[:T, :T].bool()

        scores = scores.masked_fill(
            causal_mask,
            float("-inf")
        )

        weights = torch.softmax(
            scores,
            dim=-1
        )

        context = weights @ values

        context = (
            context.transpose(1, 2)
            .contiguous()
            .view(B, T, C)
        )

        return self.out_proj(context)
    
    # ==========================================================
# Transformer Block
# ==========================================================

class TransformerBlock(nn.Module):

    def __init__(self, cfg):

        super().__init__()

        self.att = MultiHeadAttention(cfg)

        self.ff = FeedForward(cfg)

        self.norm1 = LayerNorm(cfg.emb_dim)

        self.norm2 = LayerNorm(cfg.emb_dim)

    def forward(self, x):

        # -------------------------
        # Self Attention
        # -------------------------

        shortcut = x

        x = self.norm1(x)

        x = self.att(x)

        x = x + shortcut

        # -------------------------
        # Feed Forward
        # -------------------------

        shortcut = x

        x = self.norm2(x)

        x = self.ff(x)

        x = x + shortcut

        return x
    # ==========================================================
# GPT Model
# ==========================================================

class GPTModel(nn.Module):

    def __init__(self, cfg):

        super().__init__()

        self.cfg = cfg

        # Token embeddings
        self.tok_emb = nn.Embedding(
            cfg.vocab_size,
            cfg.emb_dim
        )

        # Positional embeddings
        self.pos_emb = nn.Embedding(
            cfg.context_length,
            cfg.emb_dim
        )

        # 12 Transformer Blocks
        self.trf_blocks = nn.Sequential(
            *[
                TransformerBlock(cfg)
                for _ in range(cfg.n_layers)
            ]
        )

        # Final LayerNorm
        self.final_norm = LayerNorm(cfg.emb_dim)

        # Output head
        self.out_head = nn.Linear(
            cfg.emb_dim,
            cfg.vocab_size,
            bias=False
        )

    def forward(self, input_ids):

        B, T = input_ids.shape

        device = input_ids.device

        token_embeddings = self.tok_emb(input_ids)

        positions = torch.arange(
            T,
            device=device
        )

        position_embeddings = self.pos_emb(positions)

        x = token_embeddings + position_embeddings

        x = self.trf_blocks(x)

        x = self.final_norm(x)

        logits = self.out_head(x)

        return logits