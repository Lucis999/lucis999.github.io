Crude Oil Pricing Research

Reconstructing a mathematical market model with evidence from 2020 to 2026

New Wave | Mathematical modeling and energy markets | 5 November 2026

Executive summary

This study revisits a 2020 undergraduate hypothesis linking WTI prices, trading volume, fear and shipping activity. It preserves the original mathematical question, corrects the model and tests whether simple statistical and nonlinear models improve on a no-change forecast. The evidence favors restraint: extra predictors do not consistently improve forecasting accuracy, and empirical uncertainty ranges are less reliable during changing market conditions.

The frozen EIA WTI sample contains 1,711 observations from 2 January 2020 to 3 November 2026. The last price is $99.64 per barrel. Negative observations are preserved. The data measure spot prices, not a rolled futures strategy. [1]

Horizon in WTI observations | Random walk MAE | Ridge drivers MAE | Gradient boosting MAE

1 | 1.71 | 1.83 | 1.76

5 | 3.35 | 3.54 | 3.57

20 | 6.25 | 6.95 | 8.06

60 | 10.46 | 10.95 | 12.57

Errors are in USD per barrel. Scores are revised-history chronological backtests, not realized trading returns. Training targets mature before each forecast. The first 252 aligned observations provide warm-up, so the main evaluation excludes the 2020 collapse. A separate extension with pre-2020 training is reported in the robustness section.

Principal findings

The report's positive stationary equilibrium does not solve both original equations. A separately repaired predator-prey model has neutral cycles under fixed inputs, not demonstrated attraction. The full price-volume hypothesis cannot be empirically calibrated without defensible volume and shipping inputs. Its multiplicative price equation also cannot cross zero from a positive starting price.

The rebuilt empirical platform estimates dollar-price changes, compares five models, checks nominal 90% interval coverage, and separates statistical projections from elasticity-based scenarios. It makes no causal estimate of geopolitical shocks or claim of a profitable strategy.

The interval extension improves observed 2026 short-horizon coverage to about 90% under rules selected on pre-2026 scores, with wider ranges. A 20-observation volatility-scaled candidate reaches 84.2% coverage, still below target. Width, severe misses and exploratory uncertainty checks prevent interpreting higher coverage alone as a solved calibration problem.

Original ideas and mathematical corrections

The original draft is titled WTI Index Commodity Estimation. Its cover is dated 2 April 2020; its closing text says it was completed and uploaded on 6 April. The original files are archived unchanged with hashes. The author explicitly acknowledged that parameters had not been estimated. That admission is retained, and chart-based price guesses are not relabeled as fitted results.

P' = P(-alpha F + beta S V)<br/>V' = V[-gamma(P(t-1)-P(t)) + delta F]

Here P denotes price, V volume, F a fear index and S shipping activity. The volume equation contains a delay, so it needs an initial history and a time unit. For positive coefficients, a price fall makes its first term negative, contradicting the stated panic-volume mechanism. At a constant price, the volume equation becomes V' = delta F V &gt; 0. Therefore the claimed positive stationary equilibrium cannot satisfy the system.

The supplied Python instead sets V' = V(gamma F + delta P), drops the lag, and builds its matrix with invalid list indexing. A second unqualified Matrix call is undefined. The faithful code repair constructs the Jacobian with SymPy; it does not pretend to fix the economic assumptions.

A separate illustrative repair

P' = P(-alpha F + beta S V)<br/>V' = V(delta F - gamma P)<br/>P* = delta F / gamma; V* = alpha F / (beta S)

For fixed positive F and S, the Jacobian at this interior point has trace zero and determinant alpha delta F squared. The eigenvalues are purely imaginary. The conserved quantity H = gamma P - delta F ln(P) + beta S V - alpha F ln(V) yields closed positive level curves around the equilibrium, rather than asymptotic convergence. Time-varying inputs require a different analysis.

The illustrative integration assumes alpha=0.8, beta=0.4, gamma=0.5, delta=0.6, F=S=1, with dimensionless initial states P=1.8 and V=1.0. These parameters are assumed, not estimated. The dashboard labels this demonstration accordingly.

Limits that cannot be repaired by code alone

With finite continuous inputs, P' = P g(t) preserves the sign of P. This excludes a positive-to-negative transition such as the EIA WTI dislocation. BDI concerns dry-bulk freight rather than crude tanker demand; gross trading volume is not physical consumption. No verified contract-level volume or BDI input is substituted or invented. Full original-system calibration remains unavailable; the empirical models below answer a narrower price-prediction question.

Data definitions and provenance

Raw official downloads are retained alongside a machine-readable manifest containing source URLs, units, observation counts, coverage and SHA256 digests. The cutoff is 4 November 2026. File timestamps reflect retrieval, not the historical publication time of each observation. Missing price observations are not interpolated. [1-7]

Series | Definition and units | Count | Last period

WTI | EIA WTI Cushing spot; USD per barrel | 1711 | 2026-11-03

BRENT | EIA Europe Brent spot; USD per barrel | 1731 | 2026-11-03

INVENTORY | US commercial crude stocks excluding SPR; thousand barrels | 357 | 2026-10-30

PRODUCTION | US crude field production; thousand barrels per day | 357 | 2026-10-30

DEMAND | US product supplied demand proxy; thousand barrels per day | 357 | 2026-10-30

OVX | Cboe oil ETF implied volatility; index points | 1721 | 2026-11-04

VIX | Cboe equity implied volatility; index points | 1753 | 2026-11-04

The WTI clock defines model horizons. Other daily indicators are delayed one calendar day; weekly series are delayed ten calendar days after period end, then joined backward using the most recent eligible value. Staleness limits are seven days for daily indicators and seventeen for weekly indicators. This conservative schedule reduces timing leakage but does not recreate exact holiday publication schedules or historical vintages.

Product supplied is a US petroleum demand proxy. It is not direct world consumption. Crude production and total products supplied have different coverage and must not be subtracted as a complete US oil balance. Commercial crude stocks exclude SPR. OVX measures oil-ETF option-implied volatility and is distinct from equity VIX and realized WTI dollar volatility. [3-7,10]

Global context is kept separate

The October 2026 STEO workbook, Table 3a, supplies monthly world liquids production, consumption and inventory withdrawals for 2022-2027. This project labels periods through September 2026 as historical EIA estimates and October onward as EIA forecasts. The workbook does not supply this exhibit with 2020-2021 global observations. Its estimates and future columns are excluded from all backtest inputs. [8]

Forecast status is assigned by the October vintage boundary rather than relying on spreadsheet typography, which is not a sufficiently reliable machine-readable status flag. Historical estimates can later be revised.

Empirical modeling and evaluation design

The target is the cumulative change y(t,h) = P(t+h) - P(t), with h in {1,5,20,60} observed WTI prices. Dollar changes avoid undefined log returns at nonpositive prices. They also make errors directly interpretable, although their variance need not be stationary. The forecast is P(t) plus the predicted change.

Candidate | Fixed specification

Random walk | Predict no price change; primary benchmark.

Drift | Current price plus h times the mean historical one-step dollar change.

AR | Direct horizon regression on 1, 5 and 20 observation price changes; standardized ridge penalty 10.

Ridge drivers | The AR changes, 20-step change dispersion, delayed Brent, OVX, VIX, weekly inventory, production and demand levels and 5-observation changes; standardized ridge penalty 100.

Gradient boosting | Same full inputs; histogram gradient boosting, 60 iterations, 7 leaves, minimum 30 samples per leaf, L2 penalty 10, random seed 377.

Each expanding training set includes only feature rows whose target endpoint is at or before the forecast origin. Scaling is fitted inside each training window. Forecast origins occur every fifth aligned observation after 252 warm-up observations. Hyperparameters are fixed; there is no test-set tuning. Target maturity is asserted by the build and independently checked in the validation script.

MAE and RMSE summarize dollar errors. Direction accuracy excludes flat realized targets; the random walk abstains from direction and is displayed as such. The all-period table is a model comparison, not an estimate of the performance of selecting its winner after looking at the full test period.

A 2026 holdout and error dependence

For each horizon, a candidate is selected using only forecast errors with target dates before 2026. That fixed choice is evaluated on origins in 2026 with targets available by the snapshot. Long-horizon forecasts overlap, so origin counts overstate independent information. Paired MAE differences against the random walk also receive a circular block bootstrap with 2,000 draws, seed 377, and block length max(5, ceiling(h/5)) origins. These intervals are exploratory, with no multiple-comparison correction.

Current revised histories can contain information absent from historical releases. Release lags do not cure revision bias. This study therefore uses the term revised-history pseudo-out-of-sample and does not claim a fully investable real-time simulation.

Forecast comparisons and the 2026 holdout

Figure: backtests.png

Figure 1. Mean absolute error by model and horizon. The no-change benchmark is competitive throughout. Errors increase with the horizon; this is compatible with greater uncertainty and does not itself identify a market mechanism. Full predictions and metrics are saved as CSV files.

Horizon | Selection before 2026 | 2026 origins | Selected MAE | Random walk MAE

1 | Random walk | 42 | 2.67 | 2.67

5 | Drift | 41 | 6.00 | 6.00

20 | Random walk | 38 | 11.86 | 11.86

60 | Random walk | 30 | 23.73 | 23.73

At horizon 20, ridge-driver MAE exceeds random-walk MAE by $0.70 per barrel. Its exploratory paired block-bootstrap 95% interval is [0.22, 1.22]. This comparison does not establish that the more complex model will remain inferior in future regimes.

The selected 2026 models provide no persuasive improvement over the random walk. The five-observation drift candidate is slightly worse on the held-out year. Larger shocks also make absolute dollar errors in 2026 higher than the mixed-period average. Model selection and coverage should therefore remain visible to a portfolio viewer rather than be hidden behind one forecast line.

Feature coefficients are not interpreted causally. Simultaneous price, volatility and inventory movements can reflect common shocks, reverse causality and revisions. No identification strategy or instrumental-variable design is implemented.

Market shocks and descriptive evidence

Figure: prices.png

Figure 2. WTI and lagged Brent in the aligned modeling sample. The interactive market chart uses the original dated observations instead of the delayed feature inputs. The report preserves negative WTI values and avoids splicing in futures settlement prices.

Year | WTI mean | WTI minimum | WTI maximum | Dollar change SD

2020 | 39.16 | -36.98 | 63.27 | 4.84

2022 | 94.90 | 71.05 | 123.64 | 3.03

2026 | 87.15 | 56.01 | 114.58 | 3.76

Values are USD per barrel. The 2026 row is partial-year through the snapshot, so annual averages are not seasonally comparable. Standard deviations describe within-year daily dollar changes, not annualized percentage-return volatility.

The original April 2020 report predates the negative-price event. On 20 April, the expiring May WTI futures contract settled at -$37.63 per barrel; that settlement is distinct from the EIA spot observation. EIA connects the episode to weak consumption, limited available storage and contract-expiry conditions. This retrospective extension must not be credited to the original forecast. [9]

For 2026, EIA's October outlook describes Middle Eastern export constraints. It reports a September Brent average near $114 and forecasts a fourth-quarter average of $105. The former is historical context; the latter is an external forecast, not realized data or this project's prediction. The comparison motivates supply-risk scenarios but cannot isolate a causal supply effect from simultaneous demand responses. [8]

Volatility bands and forecast uncertainty

Horizon | Random walk coverage | Ridge coverage | Boosting coverage

1 | 88.0% | 88.0% | 87.6%

5 | 86.4% | 86.8% | 87.2%

20 | 86.1% | 88.8% | 88.8%

60 | 83.0% | 85.5% | 85.1%

Nominal coverage is 90%. For each model and horizon, the interval width is the 90th percentile of absolute errors from at most 250 previously matured forecasts; the first 30 errors are required before coverage is scored. These are symmetric empirical ranges, not Gaussian confidence intervals or guaranteed conditional coverage. Dependence and regime shifts can invalidate stable-error assumptions. The displayed undercoverage is a substantive result.

Realized volatility is summarized by EWMA dollar-change variance with lambda=0.94: sigma squared(t) = 0.94 sigma squared(t-1) + 0.06 change(t) squared. Initialization uses the first 20 changes. This is a descriptive smoother with an assumed coefficient, not a fitted GARCH model, and should not be compared numerically with annualized OVX percentages.

Revisiting the Bollinger claim

Bands use a 20-observation moving mean and two sample standard deviations. A touch of a band is an event, not proof of fair value or an inevitable reversal. Five-observation subsequent changes are examined with their actual event counts; overlapping events limit inference.

Signal | Events | Reversal frequency | Mean signed 5-step change

Lower band | 78 | 60.3% | 1.20

Upper band | 81 | 49.4% | 0.10

A separate one-unit spot experiment takes long exposure after a lower-band breach and short exposure after an upper-band breach, delayed one observation. With a hypothetical cost of $0.05 per unit of turnover, cumulative unit PnL is $20.65 across 159 exposure days. This is an arithmetic diagnostic, not a portfolio return. It omits futures rolls, collateral, financing, bid-ask variation and practical spot execution.

Neither the reversal frequencies nor the unit experiment establishes economic profitability or statistical significance. The original lower- and upper-bound price guesses are retained only in the archive.

Statistical projections and conditional scenarios

The latest origin is 2026-11-03, with WTI spot at $99.64 per barrel. The table shows the no-change statistical benchmark and its empirical nominal 90% ranges. Endpoints refer to subsequent observed WTI prices, not calendar dates; the model cannot forecast the publication calendar.

Future WTI observations | Point projection | Empirical lower | Empirical upper

1 | 99.64 | 96.12 | 103.16

5 | 99.64 | 92.02 | 107.26

20 | 99.64 | 85.92 | 113.36

60 | 99.64 | 75.53 | 123.75

Projection levels and bounds are USD per barrel. All five candidate projections are available in the dashboard and results file. The benchmark is shown here to avoid suggesting that a more elaborate line has demonstrated superiority. Historical coverage shortfalls on the previous page apply to interpreting these ranges.

A transparent supply and demand sensitivity

For small changes around a common global quantity baseline, market clearing gives an approximate price response:

Delta P / P = (demand shock - supply shock) / E<br/>P scenario = P anchor * (1 + Delta P / P)

E is the sum of supply elasticity and absolute demand elasticity. It is assumed, not estimated. With E=0.20, a 2% supply decline and unchanged demand implies a 10% price increase. The same formula implies a 10% decline for a 2% demand contraction with unchanged supply. Applying a global response directly to WTI is an explicit regional simplification.

Assumed case | E | Price response | WTI conditional level

Supply -2%, demand unchanged | 0.20 | +10% | 109.60

Demand -2%, supply unchanged | 0.20 | -10% | 89.68

Supply -2%, demand -2% | 0.20 | 0% | 99.64

Supply -2%, E sensitivity | 0.10 to 0.50 | +4% to +20% | 103.63 to 119.57

These are conditional levels, not forecasts, probability intervals or estimates of a specific conflict. The equation assigns no date, probability, inventory buffer or adjustment path. Large shocks can invalidate the local approximation. The dashboard exposes each premise so a reader can see how assumptions drive the answer.

Robustness design and principal results

The extension run on 5 November 2026 generated 15,049 additional forecasts. It evaluates 19 daily specifications at four horizons, separate weekly models and a separate 2020 shock experiment. All inputs remain frozen at the original cutoff. These are post-hoc sensitivity tests on an already inspected sample; they do not restore an untouched 2026 holdout.

Only 2 of 76 daily specification-horizon comparisons have lower MAE than their matched random walk. Both are at horizon 1. None of the 19 settings wins at horizons 5, 20 or 60 on the common daily evaluation dates. This count describes the disclosed grid, not a probability that a model or conclusion is robust.

WTI horizon | Settings beating RW | Lowest MAE ratio | Highest MAE ratio

1 | 2 / 19 | 0.98 | 1.09

5 | 0 / 19 | 1.01 | 1.13

20 | 0 / 19 | 1.02 | 1.35

60 | 0 / 19 | 1.01 | 1.21

Matched dates and fixed changes

Daily sensitivity origins are every second original origin, or every ten WTI observations. For each horizon, scores use the intersection of eligible dates across all 19 settings; each candidate faces the same realized targets and a no-change benchmark on those dates. The original full-sample metrics remain unchanged and are identified separately. Caps of 252, 504 and 756 refer to matured training rows, not exact calendar years; early windows contain fewer rows. Minimum training size is 180 matured rows.

The grid changes one factor at a time: training-window cap; weekly publication delay of 7, 10 or 14 calendar days; daily delay of 1 or 2 days; ridge penalty of 10, 100 or 1,000; boosting leaves of 3, 7 or 15; removal of risk, inventory, production, demand or Brent features; and removal of training examples touching the 2020 shock. Feature scaling is refitted inside each training window. Targets and feature histories are not compressed when shock examples are removed.

The two marginal horizon-1 improvements are the 252-row rolling ridge and the ridge trained without the 2020 episode. They do not demonstrate an exploitable edge or survive as winners across longer horizons. No sensitivity winner replaces the original deployed statistical model. No joint search over combinations or nested parameter optimization was performed.

Complete daily sensitivity grid

Entries are MAE divided by matched random-walk MAE. Below 1 favors the candidate. Scores use common eligible dates within each horizon. The grid is disclosed in full to avoid presenting only successful settings. Baseline AR, ridge and boosting reference rows are rerun on this sensitivity schedule, which differs from the original every-fifth-origin table.

Specification | 1 step | 5 steps | 20 steps | 60 steps

base_ar | 1.042 | 1.022 | 1.021 | 1.082

base_boost | 1.033 | 1.034 | 1.280 | 1.181

base_ridge | 1.068 | 1.076 | 1.101 | 1.012

boost_leaves_15 | 1.042 | 1.083 | 1.351 | 1.197

boost_leaves_3 | 1.012 | 1.015 | 1.219 | 1.177

daily_lag_2 | 1.065 | 1.075 | 1.097 | 1.017

exclude_2020_training | 0.996 | 1.043 | 1.115 | 1.149

omit_brent | 1.060 | 1.086 | 1.128 | 1.096

omit_demand | 1.070 | 1.075 | 1.092 | 1.013

omit_inventory | 1.064 | 1.063 | 1.097 | 1.018

omit_production | 1.048 | 1.064 | 1.078 | 1.059

omit_risk | 1.071 | 1.085 | 1.118 | 1.009

ridge_alpha_10 | 1.086 | 1.112 | 1.131 | 1.018

ridge_alpha_1000 | 1.030 | 1.030 | 1.033 | 1.016

weekly_lag_14 | 1.093 | 1.082 | 1.091 | 1.023

weekly_lag_7 | 1.060 | 1.071 | 1.101 | 1.020

window_252 | 0.980 | 1.109 | 1.227 | 1.207

window_504 | 1.009 | 1.135 | 1.179 | 1.110

window_756 | 1.033 | 1.125 | 1.135 | 1.014

For example, base_ridge changes only the evaluation schedule; window_252 caps its training set; weekly_lag_14 delays weekly indicators fourteen days; omit_risk removes VIX and OVX together; exclude_2020_training removes examples whose target interval or recent feature history touches March-June 2020. Other omissions remove both the level and its change where applicable. Exact specifications and per-origin forecasts are saved with the project. Revised historical values remain a limitation even after changing release delays.

Market phase frequency and shock checks

The following 20-observation results use the original forecasts. Annual rows require both origin and target to lie in the named year. Non-overlap greedily retains forecasts whose target spans do not overlap. Removing the largest 1% of realized absolute changes is an ex-post influence diagnostic only, not a deployable filter.

Period or check | RW MAE | Ridge MAE | Boosting MAE

2021 | 5.51 | 6.78 | 8.47

2022 | 8.52 | 9.61 | 10.46

2023 | 5.55 | 5.91 | 8.00

2024 | 4.12 | 4.50 | 5.49

2025 | 3.41 | 3.37 | 3.99

2026 | 11.86 | 12.52 | 13.61

Non-overlap | 6.12 | 6.67 | 8.07

Exclude top 1% moves | 5.97 | 6.66 | 7.80

The ridge model has a small advantage in 2025 at this horizon, but it is worse in the other displayed years. Both driver models remain worse after removing overlapping targets or the largest moves. Thus the broad lack of stable superiority persists, while an absolute claim that a complex model can never help would be too strong.

Separate 2020 shock and weekly tests

To evaluate the collapse without training on its future, this extension uses 2017-2019 history already contained in the frozen raw files, then predicts on every eligible WTI observation in 2020. Targets shown below remain in 2020. Negative-price origins and targets are retained. This retrospective design change is reported separately from the original study.

Horizon | RW MAE | AR MAE | Ridge MAE | Boosting MAE

1 | 1.49 | 1.70 | 1.83 | 1.56

5 | 3.17 | 3.28 | 3.74 | 3.62

20 | 7.18 | 7.32 | 8.34 | 8.44

60 | 14.00 | 13.81 | 26.08 | 15.76

In the daily 2020 extension, AR is modestly better only at horizon 60; the driver and boosting models are worse at every shown horizon. These results reinforce the need to name the exact model, horizon and period rather than claim universal superiority of any approach.

Weekly frequency

All nine weekly model-horizon comparisons have MAE ratios above one, ranging from 1.032 to 1.155. These use Friday-labeled last prices, horizons of 1, 4 and 12 weeks, every-second-week origins and a minimum of 45 matured training rows. Weekly dollar errors are not directly comparable with daily errors; each model is compared with its matched weekly baseline.

Inference calibration and remaining uncertainty

Original forecast-error differences receive 2,000 circular block-bootstrap draws at alternative block lengths. Centered two-sided bootstrap p-values are adjusted with Holm across all 48 model-horizon-block contrasts in this inference family. Pointwise confidence intervals remain unadjusted exploratory intervals. The procedure is approximate under serial dependence and does not identify causes.

Model | Block origins | MAE difference | 95% interval | Holm p

Ridge drivers | 5 | 0.70 | 0.21 to 1.20 | 0.3118

Ridge drivers | 10 | 0.70 | 0.19 to 1.25 | 0.3118

Ridge drivers | 20 | 0.70 | 0.24 to 1.24 | 0.3118

Gradient boosting | 5 | 1.81 | 0.97 to 2.72 | 0.0240

Gradient boosting | 10 | 1.81 | 0.91 to 2.76 | 0.0240

Gradient boosting | 20 | 1.81 | 1.01 to 2.68 | 0.0240

At horizon 20, gradient boosting remains worse under the tested block lengths after the disclosed multiplicity adjustment. Ridge also has positive error differences, but its adjusted p-values do not support an equally strong significance claim. Failure to reject a difference does not prove equivalence. These inference results concern the original four challenger models, not every sensitivity variant.

Interval calibration and forward verification

Period | Calibration error cap | Origins | Nominal 90% coverage | Mean width USD

All | 60 | 251 | 86.5% | 23.41

2022 | 60 | 46 | 78.3% | 27.50

2026 | 60 | 38 | 68.4% | 31.23

All | 125 | 251 | 85.3% | 22.99

2022 | 125 | 46 | 76.1% | 26.30

2026 | 125 | 38 | 55.3% | 19.73

All | 250 | 251 | 86.1% | 24.68

2022 | 250 | 46 | 76.1% | 26.30

2026 | 250 | 38 | 60.5% | 24.47

Calibration uses only previously matured errors and caps of 60, 125 or 250 origins, with at least 30 errors. Shorter windows may respond faster to a regime change, but they may also lose precision. For horizon-20 random-walk forecasts originating and ending in 2026, coverage ranges from 55.3% to 68.4% across these windows, well below 90%. The small, overlapping sample limits precision but does not justify treating these ranges as calibrated. The dashboard reports all combinations and widths; none is selected after seeing its coverage.

What this extension cannot establish

The robustness exercise is post-hoc and reuses revised data. Its 2026 observations are no longer an untouched holdout for this extension. Tests vary factors separately, so interactions remain untested. The original volume model still lacks verified inputs. No real-time data vintages, causal supply identification or executable futures strategy have been added.

The existing projections are saved in prospective_forecast_lock.json on 5 November 2026 for later scoring, retaining their original 3 November origin and 4 November data cutoff. No post-lock outcomes have been scored, no future validation has passed, and no automatic monitoring is running. These legacy-origin projections are not a new prospective experiment: some target outcomes may already have occurred before the lock. A genuine forward study must issue and timestamp forecasts at new origins before their outcomes occur, preserve the original baseline and score only those future targets without changing rules.

Prediction interval repair and evaluation design

The interval extension holds every point prediction and forecast date fixed. It compares six interval rules across the five original models and all four horizons, producing 30,030 scored intervals. Calibration requires at least 30 previous forecast errors whose target prices have already been observed. The historical data cutoff remains 4 November 2026. These methods were designed after seeing the 2026 shortfall, so the exercise remains post-hoc.

Rule | Specification

Legacy 250 | Original symmetric 90th-percentile absolute error over the last 250 matured origins.

Recent 60 | Same dollar-error approach over 60 matured origins; finite empirical rank.

Scaled 125 | Absolute error divided by dollar EWMA volatility at its own forecast origin, then calibrated over 125 matured errors and multiplied by current volatility.

Scaled 60 | Same volatility adjustment, using 60 matured errors.

Adaptive scaled 125 | Scaled rule with alpha updated once per newly matured issued interval: alpha += 0.01(0.10 - miss), clipped to 0.01-0.30.

Asymmetric scaled 125 | Separate signed standardized-error quantiles at 5% and 95%, calibrated over 125 matured origins.

Volatility uses squared WTI dollar changes and EWMA lambda=0.94, with at least 20 observations and a $0.25 daily floor. Horizon scaling is square root of h. Each historic error is divided by its own origin scale, not the scale at its target. Empirical quantile rank is ceil((n+1)q), capped at n. This finite cap, serial dependence, distribution shift and clipped delayed feedback mean no theoretical 90% coverage guarantee is asserted. The adaptive candidate is inspired by, but does not inherit the guarantees of, adaptive conformal inference. [11]

Evaluate coverage and sharpness together

For a nominal 90% interval, the interval score is width plus 20 times the distance of an actual price below the lower endpoint or above the upper endpoint. Lower is better. This proper score penalizes both uninformatively wide ranges and severe misses. Coverage alone cannot distinguish good uncertainty estimates from blanket widening. [12]

Candidate selection is frozen separately for each model and horizon using mean interval score on target outcomes before 2026. All six 2026 results remain visible. The selection exercise does not erase the fact that method design was informed by an already inspected year.

Coverage width and simple widening controls

The table focuses on 20-observation random-walk forecasts originating in 2026, with targets observed by the frozen cutoff. Each rule faces the same 38 targets. Widths and interval scores are in USD per barrel. The original point prediction remains the current price.

Interval rule | Coverage | Mean width | 90% score

Adaptive scaled 125 | 81.6% | 44.52 | 96.35

Asymmetric scaled 125 | 81.6% | 49.53 | 97.90

Legacy 250 | 60.5% | 24.47 | 107.15

Recent 60 | 68.4% | 33.58 | 110.71

Scaled 125 | 84.2% | 45.38 | 93.77

Scaled 60 | 84.2% | 66.74 | 116.14

Scaled 125 raises coverage from 60.5% to 84.2%, while increasing mean width from $24.47 to $45.38 per barrel, a 85.4% increase. Its mean interval score falls from 107.15 to 93.77, a 12.5% descriptive improvement. It still falls short of nominal 90% coverage.

What if we only widen the old interval

Fixed width multiplier | 2026 coverage | Mean width | 90% score

1.5 times | 76.3% | 36.71 | 81.38

2.0 times | 81.6% | 48.95 | 68.47

3.0 times | 100.0% | 73.42 | 73.42

The fixed 1.5, 2 and 3 multipliers are disclosed controls, not fitted to 2026. Threefold widening covers all 38 observations, but its average width reaches $73.42 per barrel. That is not evidence of a finely calibrated interval. The additional downloadable controls match each candidate's pre-2026 coverage by widening the legacy rule, with the multiplier then held fixed through 2026.

Scaled 125 has higher coverage and slightly less average width than the twofold rule, yet a worse interval score. Its remaining misses are more costly. Thus the scaled method improves one aspect of uncertainty estimation but does not dominate simple widening on all criteria. Scaled 60 obtains the same coverage as Scaled 125 with substantially more width and a worse score.

Selection uncertainty and updated research ranges

Rule versus legacy | Score difference | Exploratory 95% range

Recent 60 | 3.57 | -16.30 to 23.15

Scaled 125 | -13.37 | -51.96 to 13.46

Scaled 60 | 8.99 | -22.34 to 35.46

Adaptive scaled 125 | -10.79 | -52.37 to 17.76

Asymmetric scaled 125 | -9.25 | -46.87 to 16.50

Differences use paired scores on 38 origins, with 2,000 circular block-bootstrap draws and four-origin blocks. Negative favors the candidate. Every displayed interval includes zero, so a clear improvement in expected score is not established. The small, overlapping sample and post-hoc comparisons also limit inference. These intervals are not adjusted for multiplicity.

Selection before seeing 2026 outcomes

Horizon | Pre-2026 choice | 2026 coverage | Chosen score | Legacy score

1 | Asymmetric scaled 125 | 90.5% | 16.99 | 18.62

5 | Scaled 60 | 90.2% | 36.74 | 50.25

20 | Recent 60 | 68.4% | 110.71 | 107.15

60 | Scaled 125 | 73.3% | 253.67 | 192.75

For horizon 20, the pre-2026 score rule chooses Recent 60, not the retrospectively attractive Scaled 125. Recent 60 raises 2026 coverage to 68.4% but worsens the mean interval score. This failed transfer is reported rather than replaced with a winner chosen on 2026.

Research alternatives at the legacy origin

Range at 3 November origin | Lower | Upper | Width

Legacy 250 | 85.92 | 113.36 | 27.44

Recent 60 | 74.24 | 125.04 | 50.80

Scaled 125 | 73.02 | 126.26 | 53.23

These are new research ranges around the unchanged $99.64 point projection. The original legacy ranges remain archived and displayed separately. No new prospective forecast is claimed. The present evidence supports partial coverage improvement with explicit costs, not a claim that the 2026 calibration problem is solved.

Interactive shipping congestion illustration

Figure: shipping-diagram.png

The dashboard adds an interactive oil-shipping bottleneck diagram. Arrivals, usable transit capacity, disruption duration and inventory-buffer days are adjustable. Vessel icons build into a queue when arrival flow exceeds capacity; illustrative storage tanks show how a buffer can absorb delayed cargo even while the queue continues to grow.

This is a deterministic fluid-queue scenario with zero initial backlog. Normal capacity is assumed to be 20 vessel-equivalents per day and each vessel-equivalent carries 0.2 million barrels. Those are illustrative inputs, not measurements of a named port or route. Vessel icons are schematic and capped in number. No live AIS data or tanker tracking is used.

Queue = max(0, arrivals - capacity) times duration. Available buffer cargo equals arrivals times buffer days. Unbuffered delayed cargo equals max(0, queue - buffer cargo) times the assumed cargo size. Once normal capacity is restored, clearance time equals queue divided by normal capacity minus arrivals, holding arrivals fixed. The diagram restricts arrivals below normal capacity so that clearance remains finite.

Preset | Arrivals per day | Capacity per day | Days | Queue | Unbuffered million barrels

Open route | 10 | 20 | 14 | 0 | 0.0

Buffered disruption | 10 | 8 | 14 | 28 | 0.0

Severe congestion | 14 | 6 | 21 | 168 | 19.6

The default buffered scenario assumes seven buffer days; the severe preset assumes five. Backlog divided by current capacity is a diagnostic and must not be called an estimated average waiting time. Delayed cargo is not automatically permanent supply loss. The queue model omits vessel classes, stochastic arrivals, port operations, rerouting and replenishment constraints.

The extended animation follows disruption, stock drawdown and reopening, then connects an assumed refinery and distribution stage to fuel stations, freight and homes. Processing and delivery lags are compressed. Full means the chosen scenario buffer, not real tank capacity. Supply-gap and low-buffer price-pressure labels are qualitative assumptions, not pump-price estimates. Retail prices also depend on refining, distribution and taxes [13]. These mechanisms do not enter fitted forecasts or intervals.

New models: small gains, no clear winner

Six additions test typical changes, resistance to unusual moves, small median trees and conservative blending. This post-hoc study was designed after earlier results, including 2026, were examined. It is not an independent future test.

Same dates, same benchmark

The extension adds 6,810 predictions on the exact original origin grid. Training uses only matured targets and at most 504 rows (252 for recent median). Median AR and Huber AR use three price-change inputs; boosting and recent ridge use the 13 original inputs. Recent ridge and the ensemble retain only 25% of the estimated change, pulling forecasts toward no change. All fixed settings are saved in model-extension-protocol.json; none was retuned after these scores. Estimator definitions follow scikit-learn [14-16].

New candidate | 1 step | 5 steps | 20 steps | 60 steps

Recent median | +0.01% | -0.50% | -4.13% | -5.23%

Median AR | -0.17% | -0.93% | -3.88% | -6.48%

Huber AR | +0.33% | -2.90% | -5.43% | -5.44%

Median boosting | -0.35% | -2.51% | -9.63% | -6.61%

Shrunk recent ridge | +0.32% | -1.26% | -2.68% | +0.85%

Conservative ensemble | +0.09% | +0.07% | -0.67% | +0.45%

Positive percentages mean lower mean absolute error than no change; negative means worse. Across the full sample, Huber AR reduces one-step error from $1.7139 to $1.7083 per barrel (0.33%). Shrunk recent ridge reduces 60-step error from $10.4571 to $10.3682 (0.85%). No added model improves the 20-step comparison. At five steps, the original drift model still has the lowest full-sample error among all candidates.

Do small gains survive uncertainty?

Paired loss-difference 95% bootstrap ranges are -0.0370 to 0.0249 dollars for one-step Huber AR and -0.5226 to 0.3905 for 60-step shrunk ridge: both include no advantage. Each Holm-adjusted p-value is 1.000 across 48 contrasts. The exploratory bootstrap uses 2,000 circular draws and blocks of max(5, ceiling(h/5)) origins. Overlap and revised history remain limitations.

Selection using earlier scores, reported on 2026

Selection uses pre-2026 target errors among all eleven models. The choices are Huber AR at one step, conservative ensemble at five and sixty, and no change at twenty. Their 2026 errors versus no change are $2.6694 versus $2.6710, $6.0417 versus $5.9951, $11.8621 versus $11.8621 and $23.6534 versus $23.7297, respectively. The gains are tiny or reverse. Original forecasts and intervals are preserved; no new live forecast is issued.

Reading the visual research page

Start with the mechanism: Shipping Lab

The page leads with a visual question: what happens between a delayed ship and everyday fuel supply? In Buffered disruption, stock covers the missing flow while daily deliveries continue. In Severe congestion, drag the timeline to about 30%: the chosen buffer is exhausted and the scenario meets about 43% of assumed daily need. Continue past reopening to watch supply recover and stock refill.

The tank shows a chosen scenario buffer, not measured total capacity. Refining and delivery lags are compressed. Price-pressure labels illustrate assumed direction without a pump-price calculation or a causal estimate. No animation value enters the fitted forecasting models.

Then change a price assumption

The conditional-price exhibit asks what might follow from a selected supply-demand change and an assumed adjustment strength. Its displayed level is not a forecast with a measured probability. It follows the shipping illustration so readers can connect a physical mechanism with a separate, explicitly assumed price response.

Check the question and the market record

The 2020 project asked whether fear, trading and shipping could explain oil-price behavior. That remains a reasonable question, but its original equations did not estimate those links from data or establish stable recovery. The rebuilt empirical question is narrower: can a forecast make smaller mistakes than keeping the current price? Historical charts describe changes without proving their causes.

Official history includes the negative 2020 spot observations and the 2026 market-stress period. The frozen 2026 WTI sample contains 211 prices through 3 November. Spot prices are distinguished from futures, estimates from forecasts and observed records from scenario assumptions. Market exploration is available on the page; the mathematical audit remains documented in the full report.

Finish with models and reliability

Models are compared on identical dates. Some added candidates reduce historical errors slightly, but the uncertainty ranges include no advantage. All unsuccessful candidates remain visible. Revised histories and previously inspected outcomes mean the study is retrospective, not a new prospective test.

A prediction range is a safety margin: too narrow misses prices; too wide offers little guidance. At five observed-price steps, the earlier rule catches 24 of 41 dated 2026 outcomes and the rule chosen from older scores catches 37. Mean width rises from $13.06 to $26.51 per barrel. Longer horizons remain difficult. Dots summarize counts rather than date order.

Limits and next evidence

The project can support a documented audit, reproducible model comparisons and clear mechanism visualization. It does not yet establish a dependable forecasting edge, causal shock attribution or trading profitability. The next decisive step is to fix methods and record new timestamped forecasts before their outcomes become available.

Conclusions limitations and reproduction

The original project's useful idea is to connect market behavior and physical conditions through explicit dynamics. Rebuilding it reveals that the proposed equilibrium, code and technical-indicator interpretation need correction. The full original model cannot yet support empirical price forecasts. A separate, reproducible price-change comparison shows that adding drivers and nonlinear structure does not consistently beat a no-change benchmark in this sample.

The strongest portfolio outcome is a transparent research process: preserved source work, auditable mathematical corrections, official frozen datasets, chronological model comparison, visible coverage failures and clearly conditional scenarios. Model limitations are part of the result.

Interval repair provides partial progress. In the inspected 2026 sample, the pre-2026-selected short-horizon rules improve coverage and mean interval scores; the medium- and long-horizon choices remain inadequate. Volatility scaling is a research alternative with visible width costs and uncertain score improvement, not a guarantee of calibrated forecasts. The shipping interaction explains an assumed queue-and-buffer mechanism without feeding invented shipping data into the model.

Material limitations

The study uses revised histories and conservative assumed publication lags. It lacks historical data vintages, verified original-model volume and BDI inputs, a full 2020-2021 global balance, contract-level futures roll accounting and causal identification. The main design excludes 2020; the separately disclosed shock test uses pre-2020 warm-up. Forecast errors overlap across long horizons; bootstrap intervals are exploratory. Fixed model settings were not selected by a nested optimization study.

Further work should acquire vintages and contract-defined volume, preregister genuinely prospective forecast origins and test the repaired system only after defining observable state variables. A GARCH/ARIMA study could be a separate extension; this release implements EWMA, regularized direct AR models and histogram boosting without mislabeling them as those methods.

Reproduction

Use Python 3.12 in an isolated environment and install requirements.txt. Run src/rebuild.py, src/diagnostics.py, src/robustness.py, src/robustness_publish.py, src/intervals.py, src/report.py, src/validate.py, src/validate_robustness.py and src/validate_intervals.py in that order. The default build uses saved raw inputs; --download deliberately refreshes the seven primary snapshots and changes the study vintage. The global October workbook is separately frozen. Reproducing report page images also needs Poppler. README.md gives exact commands and a data dictionary.

Generated outputs include per-origin predictions with training dates, horizon metrics, global balance statuses, original-file hashes, bootstrap comparisons and a browser data bundle. The same results file feeds the report and dashboard. The original archive is excluded from hosted content because it contains personal academic metadata.

References and data sources

[1] EIA WTI Cushing daily spot. <link href="https://www.eia.gov/dnav/pet/hist_xls/RWTCd.xls" color="#087e83">https://www.eia.gov/dnav/pet/hist_xls/RWTCd.xls</link>

[2] EIA Europe Brent daily spot. <link href="https://www.eia.gov/dnav/pet/hist_xls/RBRTEd.xls" color="#087e83">https://www.eia.gov/dnav/pet/hist_xls/RBRTEd.xls</link>

[3] EIA commercial crude inventory. <link href="https://www.eia.gov/dnav/pet/hist_xls/WCESTUS1w.xls" color="#087e83">https://www.eia.gov/dnav/pet/hist_xls/WCESTUS1w.xls</link>

[4] EIA crude production. <link href="https://www.eia.gov/dnav/pet/hist_xls/WCRFPUS2w.xls" color="#087e83">https://www.eia.gov/dnav/pet/hist_xls/WCRFPUS2w.xls</link>

[5] EIA product supplied. <link href="https://www.eia.gov/dnav/pet/hist_xls/WRPUPUS2w.xls" color="#087e83">https://www.eia.gov/dnav/pet/hist_xls/WRPUPUS2w.xls</link>

[6] Cboe OVX history. <link href="https://cdn.cboe.com/api/global/us_indices/daily_prices/OVX_History.csv" color="#087e83">https://cdn.cboe.com/api/global/us_indices/daily_prices/OVX_History.csv</link>

[7] Cboe VIX history. <link href="https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv" color="#087e83">https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv</link>

[8] EIA October 2026 global outlook and tables. <link href="https://www.eia.gov/outlooks/steo/report/global_oil.php" color="#087e83">https://www.eia.gov/outlooks/steo/report/global_oil.php</link>

[9] EIA negative WTI analysis April 2020. <link href="https://www.eia.gov/TodayinEnergy/detail.php?id=43495" color="#087e83">https://www.eia.gov/TodayinEnergy/detail.php?id=43495</link>

[10] Cboe OVX methodology context. <link href="https://www.cboe.com/us/indices/dashboard/ovx/" color="#087e83">https://www.cboe.com/us/indices/dashboard/ovx/</link>

[11] Gibbs and Candes 2021 Adaptive Conformal Inference. <link href="https://proceedings.neurips.cc/paper_files/paper/2021/hash/0d441de75945e5acbc865406fc9a2559-Abstract.html" color="#087e83">https://proceedings.neurips.cc/paper_files/paper/2021/<br/>hash/0d441de75945e5acbc865406fc9a2559-Abstract.html</link>

[12] Gneiting and Raftery 2007 Proper Scoring Rules. <link href="https://sites.stat.washington.edu/people/raftery/Research/PDF/Gneiting2007jasa.pdf" color="#087e83">https://sites.stat.washington.edu/people/raftery/Research/PDF/Gneiting2007jasa.pdf</link>

[13] EIA Factors affecting gasoline prices. <link href="https://www.eia.gov/energyexplained/gasoline/factors-affecting-gasoline-prices.php" color="#087e83">https://www.eia.gov/energyexplained/gasoline/factors-affecting-gasoline-prices.php</link>

[14] scikit-learn median regression. <link href="https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html" color="#087e83">https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html</link>

[15] scikit-learn Huber regression. <link href="https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.HuberRegressor.html" color="#087e83">https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.HuberRegressor.html</link>

[16] scikit-learn histogram boosting. <link href="https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html" color="#087e83">https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html</link>