# Historical EEG visualization method

Source: user-uploaded `s1.mat`, variables `y` (13776×8), `trig` (13776×1), `fs` (250).

- Target trigger = +1; non-target trigger = -1.
- Epoch [-100ms, +700ms) around each event, 200 samples per epoch.
- Exclude events whose epochs cross the recording boundaries.
- Apply 4th-order Butterworth 1–20 Hz bandpass with zero-phase SOS filtering to continuous data.
- Subtract mean of the first 25 samples (100ms prestimulus) per epoch and channel.
- Normalize each channel by its pooled epoch standard deviation, then average across events.
- Plot pooled 8-channel mean and export per-channel target/non-target averages.

The filtering, normalization, and aggregation are new presentation choices, not claimed to match the exact original 2023 model pipeline. This exploratory view is not a P300 significance test, classifier validation, or subject-generalization result. The browser game uses entirely separate synthetic data.
