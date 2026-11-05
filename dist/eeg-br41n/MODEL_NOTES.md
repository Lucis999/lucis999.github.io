# Model review

- `EEGClassifier.py` and several numbered variants instantiate a PyTorch `RNN` class using `nn.GRU`.
- `EEGClassifier_4.py` includes `nn.GRU(input_size, hidden_size, num_layers, batch_first=True, dropout=dropout, bidirectional=False)` and a linear output layer.
- `EEGClassifier_5.py` adds an intermediate linear layer between GRU and classifier output.
- `RNN_Demo.py` also instantiates `nn.GRU`.
- GRU is not LSTM. Both are gated recurrent networks; GRU generally has fewer parameters at equivalent input and hidden dimensions, but this is not proof of faster performance or superior accuracy on the historical data.
- No controlled GRU/LSTM comparison or explicit historical rationale for choosing GRU was established from the reviewed files.
- The site intentionally distinguishes the synthetic letter game, historical EEG visualizations, and the reported evaluation accuracy.
