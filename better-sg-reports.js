( () => {
    'use strict';

    // ── Version / release ───────────────────────────────────────────────────────
    const SGD_VERSION = '2.1.0';
    const SGD_RELEASE = '2026-06-01';

    // Cobblestone Learning brand assets — see ~/.claude/skills/cobblestone-brand
    // Logo is a lightweight inline-SVG wordmark (brand cyan/blue, Montserrat fallback) so the
    // dashboard stays on-brand and self-contained without the old ~230KB base64 payload.
    const CBL_LOGO = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 178 56'><g><rect x='2' y='14' width='13' height='13' rx='3' fill='%2327AAE1'/><rect x='17' y='14' width='13' height='13' rx='3' fill='%230074B4'/><rect x='2' y='29' width='13' height='13' rx='3' fill='%230074B4'/><rect x='17' y='29' width='13' height='13' rx='3' fill='%2327AAE1'/></g><text x='40' y='27' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='19' font-weight='700' fill='%233D3D3D'>Cobblestone</text><text x='40' y='45' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='14' font-weight='600' letter-spacing='0.5' fill='%2327AAE1'>Learning</text></svg>`;
    // Branded header/footer bands for print-ready reports — inline SVG (were base64 JPEGs).
    // Per Cobblestone brand spec: header band on every page top, footer band on every page bottom.
    const CBL_HDR_JPEG = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 794 106'><rect width='794' height='106' fill='%23FFFFFF'/><g><rect x='24' y='30' width='22' height='22' rx='5' fill='%2327AAE1'/><rect x='50' y='30' width='22' height='22' rx='5' fill='%230074B4'/><rect x='24' y='56' width='22' height='22' rx='5' fill='%230074B4'/><rect x='50' y='56' width='22' height='22' rx='5' fill='%2327AAE1'/></g><text x='88' y='52' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='30' font-weight='700' fill='%233D3D3D'>Cobblestone <tspan fill='%2327AAE1'>Learning</tspan></text><text x='88' y='78' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='13' font-weight='600' letter-spacing='2' fill='%23939393'>LEARNING. CREATIVITY. TRUST.</text><rect x='0' y='103' width='794' height='3' fill='%2327AAE1'/></svg>`;
    const CBL_FTRD_JPEG = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 794 82'><rect x='0' y='0' width='794' height='2' fill='%2327AAE1'/><text x='397' y='34' text-anchor='middle' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='12' font-weight='600' fill='%233D3D3D'>Cobblestone Learning</text><text x='397' y='54' text-anchor='middle' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='10.5' fill='%23939393'>5 Lombard Street, Dublin 2, Ireland  &#183;  www.cobblestonelearning.com  &#183;  +353 1 908 1582</text><text x='397' y='72' text-anchor='middle' font-family='Montserrat,Helvetica,Arial,sans-serif' font-size='9' font-weight='600' letter-spacing='1.5' fill='%2327AAE1'>LEARNING. CREATIVITY. TRUST.</text></svg>`;
    const CBL = {
        cyan: '#27AAE1',
        blue: '#0074B4',
        yellow: '#FFC20E',
        grey: '#939393',
        dark: '#3D3D3D',
        bgLight: '#F8F9FB',
        border: '#E8ECF0',
        ok: '#2D9E5A',
        okBg: '#F0FAF3',
        okBorder: '#B7E4C5',
        crit: '#C0392B',
        amber: '#8A6500',
        amberBg: '#FFF8E1'
    };

    const TIPS = {
        cpu_seconds: '<strong>CPU Seconds</strong> — total server processing time consumed by a site.<br><br>Every PHP request, database query, AJAX call, and cron job burns CPU seconds like fuel.<br><br><span style="color:#4ade80">✅ Healthy:</span> consistent day-to-day values, no sudden spikes<br><span style="color:#fbbf24">⚠️ Concern:</span> values 2× above the site\'s own 7-day average<br><span style="color:#f87171">🔴 Problem:</span> values 5×+ above average, or relentless escalation<br><br><em>Common spike causes: SCORM/xAPI state saves, unoptimised queries, bot traffic, broken cron.</em>',
        program_executions: '<strong>Program Executions</strong> — how many times PHP was invoked on the server.<br><br>Compare with CPU Seconds to understand root cause:<br>• Exec ↑ + CPU ↑ together → <em>volume problem</em> (too many requests)<br>• Exec stable + CPU ↑ → <em>weight problem</em> (each request heavier)<br>• Exec ↓ + CPU ↓ more → <em>fix confirmed</em> (blocking wasteful requests before PHP runs)<br><br><span style="color:#4ade80">✅ Good fix signal:</span> CPU/exec ratio drops — each request now cheaper<br><span style="color:#f87171">🔴 Bad signal:</span> ratio rises while executions fall — fewer requests but each one heavier',
        core_pct: '<strong>Cores in Use</strong> — how many CPU cores the whole server is using right now (or on a given day).<br><br>SiteGround\'s API returns the raw value as "% of one core" — 100% = one full core, 200% = two cores, etc. We divide by 100 to get cores. So a reading of 0.6 cores on a 9-core plan means you\'re using 6.7% of plan capacity. The number is <strong>plan-immune</strong>: 0.6 cores is 0.6 cores whether the plan is 7 or 9.<br><br>SiteGround measures in 15-second windows.<br><br><span style="color:#4ade80">✅ Comfortable:</span> below 50% of plan<br><span style="color:#fbbf24">⚠️ Elevated:</span> 50–75% of plan<br><span style="color:#f87171">🔴 Critical:</span> 75%+ of plan — requests queued, users experience slowdowns now<br><br><em>Short spikes are normal. Sustained readings near saturation require investigation.</em>',
        control_group: '<strong>Control Group</strong> — unmodified sites used as a comparison baseline.<br><br>If all sites get quieter after your fix, that could be a quiet week — not your fix. The control group distinguishes fix effect from ambient traffic reduction.<br><br><span style="color:#4ade80">✅ Strong fix evidence:</span> target drops, control stays flat or rises<br><span style="color:#fbbf24">⚠️ Ambiguous:</span> both dropped but target more than control<br><span style="color:#f87171">🔴 Weak evidence:</span> both dropped proportionally — likely just a quiet period',
        network_change: '<strong>Network Change</strong> — every other active site on the account, summed.<br><br>The "control group" is a small curated sample (e.g. Top 5 or LMS Core); the network is the <em>whole rest of the account</em>. It\'s the broadest possible ambient-traffic reference.<br><br><span style="color:#4ade80">✅ Useful:</span> if the network rose while your target fell, the fix is clearly site-specific<br><span style="color:#f87171">🔴 Warning:</span> if the network fell by a similar amount, much of your target\'s improvement may just be a quiet week',
        net_effect: '<strong>Net Effect (Difference-in-Differences)</strong> — the target\'s % change <em>minus</em> the comparison group\'s % change.<br><br>The comparison group is whatever you pick in <strong>Compare Against</strong>: your selected like-for-like peers, or the whole network if you choose that. This is the single number that answers "did my fix actually do anything?" — it removes the ambient drift the comparison group also saw.<br><br><span style="color:#4ade80">✅ Strong fix:</span> strongly negative (e.g. -25 pp) — target dropped much more than the comparison group<br><span style="color:#fbbf24">→ Noise:</span> near 0 — target moved with the group, no isolated effect<br><span style="color:#f87171">🔴 Regression:</span> positive — target got worse relative to peers<br><br><em>Reported in percentage points, not %. A net effect of -20 pp means the target fell 20 percentage points more than the comparison group did. When you pick a small group the credibility score drops — a 2-site baseline is noisier and easier to cherry-pick than the whole network.</em>',
        expected_after: '<strong>Expected After (Counterfactual)</strong> — what the target\'s after-CPU would be if it had drifted at the same rate as the rest of the network.<br><br>Comparing <em>actual after</em> against this number is the cleanest single-number "savings" estimate.<br><br><span style="color:#4ade80">✅ Saved:</span> actual < expected — the fix kept CPU below what ambient drift alone predicted<br><span style="color:#f87171">🔴 Lost:</span> actual > expected — the target underperformed peers',
        site_rank: '<strong>Site Rank</strong> — where the target sits among all active sites when ranked by before→after % change.<br><br>Rank 1 = biggest improvement (largest CPU drop). Rank N = biggest regression.<br><br>The percentile reframes that as "the target improved more than X% of sites." Combined with the network change, it tells you whether your target was uniquely improved or merely went along for the ride.',
        plan_change: '<strong>Plan Change</strong> — the date SiteGround upgraded or downgraded your account\'s cores or memory.<br><br>Detected automatically from <code>limits_list</code> in the API response.<br><br><span style="color:#4ade80">✅ Every metric on this dashboard is plan-immune:</span> CPU seconds, executions, cores in use, and GB used are all absolute measurements. A day that used 1.47 cores is shown as 1.47 cores regardless of whether the plan was 7-core or 9-core on that day.<br><br><span style="color:#27aae1">ℹ️ What changes after the upgrade:</span> the "% of plan" subtitle next to each absolute reading — 1.47 cores was 21% of 7-core plan, now it\'s 16.3% of 9-core plan. The cores number is the same; the % framing scales.<br><br><em>The purple marker on charts is purely informational.</em>',
        core_peak: '<strong>Daily Peak Cores</strong> — the single highest 1-hour cores-in-use reading for that day.<br><br>Different from the daily <em>average</em> SiteGround reports as the "daily" value: a day with 2.8 cores peak and 0.95 cores average is a bursty day, not a quiet one. The peak is what determines whether users felt slowdowns.<br><br>Derived from the hourly stream — needs hourly data captured (open SG Statistics → Last 24 Hours to populate).',
        mem_combined: '<strong>Combined Memory (real + cache)</strong> — process memory plus filesystem cache as a % of plan limit.<br><br><em>Real</em> is what gets OOM-killed; <em>cache</em> is reclaimable. But once combined memory exceeds ~75% the OS starts evicting cache, page faults rise, and any growth in real risks an out-of-memory event.<br><br><span style="color:#4ade80">✅ Safe:</span> &lt;60%<br><span style="color:#fbbf24">⚠️ Watch:</span> 60–75%<br><span style="color:#f87171">🔴 Pressure:</span> &gt;75% — even though "real" alone may look fine.',
        burst_score: '<strong>Burst Score</strong> — peak-hour CPU as a % of the site\'s last-24h total.<br><br>Tells you whether a site is bursty (one bad hour does all the damage) or steady (organic spread across the day).<br><br><span style="color:#4ade80">✅ Steady: &lt;10%</span> — typical organic traffic<br><span style="color:#fbbf24">⚠️ Spiky: 10–25%</span> — heavy single-hour peaks, often scheduled tasks<br><span style="color:#f87171">🔴 Burst: &gt;25%</span> — one cron job or batch process is the whole story',
        activity_class: '<strong>Activity Class</strong> — categorical change for the site over the comparison window.<br><br><strong>NEW</strong>: was 0 before, has traffic now<br><strong>DIED</strong>: had traffic, now 0<br><strong>GREW</strong>: CPU rose &gt;25%<br><strong>SHRANK</strong>: CPU fell &gt;25%<br><strong>STABLE</strong>: within ±25%<br><strong>INACTIVE</strong>: zero in both windows<br><br>Used to filter the all-sites ranking so a site going 1→100 doesn\'t spam the leaderboard with a +9900% non-result.',
        cpu_exec_growth: '<strong>CPU vs Exec Growth</strong> — did each request get cheaper or heavier across the window?<br><br>Equal CPU and exec growth = same per-request cost. CPU grew faster than exec = each call is now more expensive (heavier code path, bigger queries, slower endpoints). Exec grew faster than CPU = each call is cheaper (optimisation, cache warmth, lighter routes).<br><br>Best fix signal: exec stays similar, per-request cost drops — same traffic, each hit cheaper.',
        credibility: '<strong>Credibility Score</strong> (0–100) — how trustworthy this Before/After analysis is, given the data we have.<br><br>Combines: window length (≥7 days both sides best), weekday-pair coverage (matching weekdays before vs after), plan-change-straddle (huge negative if window crosses an upgrade), and statistical significance of the weekday-paired difference-in-differences (which carries the variance of the comparison group, and is tempered when the series is autocorrelated).<br><br><span style="color:#4ade80">✅ High (75–100):</span> safe to present to management<br><span style="color:#fbbf24">⚠️ Moderate (50–74):</span> directional, not conclusive<br><span style="color:#f87171">🔴 Low (&lt;50):</span> add more data before drawing conclusions',
        weekday_paired: '<strong>Weekday-Paired Analysis</strong> — compares before vs after using only days that match weekdays in both windows.<br><br>Removes the seasonality bias where a before-window heavy on weekdays vs an after-window with weekends would look like a fix when it\'s just calendar mix.<br><br>Pair count = how many distinct weekdays got matched. 7 = ideal (full week represented on both sides); fewer = less robust.',
        did_residual: '<strong>DiD Residual t-test</strong> — Welch\'s t-test on per-day differences between the target and what the network\'s growth rate predicts for it.<br><br>Where the headline Welch\'s t-test asks "did the target\'s number change?", this asks "did the target deviate from network drift?" That\'s the more honest statistical test of the fix\'s isolated effect.<br><br>p &lt; 0.05 = the deviation is unlikely to be random noise.',
        headroom: '<strong>Cores in Use</strong> — how many of your plan\'s cores are currently doing work, out of the total.<br><br>0.6 / 9 means 0.6 cores are in use and 8.4 are free. We lead with the absolute number because "how fast we\'re going" is the useful question for analysing workload; the "% of plan" framing matters only for capacity planning ("will we need to upgrade?").<br><br>Cores in use is <strong>plan-immune</strong> — the number doesn\'t change just because SG bumped you from a 7-core to a 9-core plan.',
        dead_site: '<strong>Dead / Parked Site</strong> — a site on the account with zero CPU activity over the captured period. Likely staging, suspended, or pointing elsewhere.<br><br>Dashed out by default to keep rankings honest. Surface them via the All-Sites table if you want to confirm.',
        target_share: '<strong>Target Share of Account</strong> — the target site\'s CPU as a % of the entire server total.<br><br>Immune to traffic fluctuations. If the server gets quieter overall, shares stay the same.<br><br><span style="color:#4ade80">✅ Fix confirmed:</span> target\'s share drops — proportionally cheaper vs everything else<br><span style="color:#f87171">🔴 Problem:</span> target\'s share growing — consuming increasing fraction of shared resources<br><br><em>Example: site drops from 12% → 5% of server CPU — a real fix regardless of traffic levels.</em>',
        target_ratio: '<strong>Target / Control Ratio</strong> — target CPU as a % of the control group\'s combined CPU.<br><br>The gold standard for isolating fix effectiveness from background noise.<br><br><span style="color:#4ade80">✅ Fix confirmed:</span> ratio drops significantly — target improved more than its peers<br><span style="color:#f87171">🔴 No effect:</span> ratio unchanged — fix had no isolated impact<br><br><em>Example: ratio 14% → 6.5% while control rose 18%. Fix was causal, not ambient.</em>',
        trend7: '<strong>7-Day Trend</strong> — last 7 days vs the 7 days before that.<br><br><span style="color:#4ade80">✅ Improving:</span> negative % (CPU reducing week-on-week)<br><span style="color:#64748b">→ Stable:</span> near 0%<br><span style="color:#f87171">🔴 Worsening:</span> strongly positive — CPU climbing week-on-week, investigate before it causes incidents',
        peak_day: '<strong>Peak Day</strong> — single highest daily CPU value in the period.<br><br>Peaks matter more than averages for server stability. A site averaging 5,000 but peaking at 50,000 can briefly saturate the server for all other sites.<br><br><span style="color:#4ade80">✅ Stable:</span> peak within 2–3× daily average<br><span style="color:#fbbf24">⚠️ Spiky:</span> peak 5–10× average<br><span style="color:#f87171">🔴 Unstable:</span> peak 10×+ average — runaway process or traffic incident',
        incomplete_day: '<strong>Partial Day</strong> — today\'s data is still accumulating.<br><br>Flagged when total CPU is less than 25% of the 7-day rolling average.<br><em>Partial days are automatically excluded from all averages, benchmarks, and before/after calculations.</em>',
        fix_date: '<strong>Fix / Event Date</strong> — the dividing line between before and after.<br><br>Choose the date you deployed the fix or applied a config change.<br><br><em>Tip: wait 5–7 complete days after the fix before presenting results. With 2–3 days, one high-traffic day in the after window can skew the comparison significantly.</em>',
        account_total: '<strong>Account Total CPU</strong> — combined CPU seconds for all sites on your account.<br><br><span style="color:#4ade80">✅ Good:</span> stable or trending down<br><span style="color:#f87171">🔴 Problem:</span> spiking — one site likely out of control; check shares to identify which one',
        cpu_exec_ratio: '<strong>CPU per Execution</strong> — average CPU seconds spent per PHP invocation.<br><br>Isolates whether a fix reduced load <em>volume</em> (fewer requests) or <em>cost</em> (each request cheaper).<br><br><span style="color:#4ade80">✅ Reduced overhead:</span> ratio drops — each call costs less (e.g. early-intercept bypassing PHP bootstrap)<br><span style="color:#fbbf24">→ Reduced volume only:</span> ratio same, executions down — requests blocked before starting<br><span style="color:#f87171">🔴 Worse:</span> ratio rises — fewer requests but each heavier, worth investigating',
        health_score: '<strong>Health Score (0–100)</strong> — composite server condition indicator.<br><br>Combines: live cores in use vs plan limit, recent CPU trend vs 7-day average, per-site anomalies from hourly data, live memory vs plan limit, and site-concentration (HHI).<br><br><span style="color:#4ade80">✅ 75–100: Healthy</span> — operating normally<br><span style="color:#fbbf24">⚠️ 45–74: Elevated</span> — some load pressure, monitor<br><span style="color:#f87171">🔴 0–44: Under Pressure</span> — investigate immediately',
        barometer: '<strong>Load Barometer</strong> — real-time server pressure at 15-second resolution.<br><br>The last 30 minutes of cores-in-use — the fastest available signal of server stress. Thresholds scale with your plan size: 75% of plan is the saturation line regardless of whether the plan is 7 or 9 cores.<br><br><span style="color:#4ade80">✅ Low:</span> steady below 50% of plan — server cruising<br><span style="color:#fbbf24">⚠️ Elevated:</span> trending toward 75% — monitor next 30 min<br><span style="color:#f87171">🔴 High:</span> sustained 75%+ — users experiencing slowdowns right now',
        fix_focus: '<strong>Fix Focus</strong> — which kind of improvement you\'re trying to demonstrate.<br><br>The dashboard tailors its headline card, verdict, and primary statistical test to the metric you pick: cost per execution, execution volume, CPU seconds, memory used, or server cores in use.<br><br><em>Choose</em> <strong>Combination</strong> when the fix spanned several axes (e.g. blocked a bot AND optimised a function). The default <em>Show everything</em> matches the original Before/After layout.',
    };

    // GUIDE: structured glossary, source of truth for the Guide tab and Explain mode subtitles.
    // Each entry: { layman, technical, whenItMatters, whereToFind, severity? }
    // - layman: one sentence, no jargon, no thresholds
    // - technical: how it's actually computed and what assumptions hold
    // - whenItMatters: the user-facing question this metric answers
    // - whereToFind: which tab(s) surface it
    const GUIDE = [{
        section: 'Capacity',
        items: [{
            key: 'cpu_seconds',
            title: 'CPU Seconds',
            layman: 'How much processing power your sites used — think of it as an electricity meter for the server.',
            technical: 'Sum of CPU time consumed by all PHP, MySQL, cron, and background processes on the account, in seconds. SG reports per-site totals plus an account total. We dedupe SG\'s double-emit (real value + 0 sentinel per day) using <code>Math.max</code> per date.',
            whenItMatters: 'When SiteGround warns you\'re approaching the CPU-seconds plan ceiling, or when you want to know which sites are doing the most work.',
            whereToFind: 'Health → "Live Hourly CPU" · Sites → "Total CPU" column · Trends → "CPU Seconds — Daily"'
        }, {
            key: 'program_executions',
            title: 'Program Executions',
            layman: 'How many times PHP actually ran. Each page load, AJAX call, or cron tick counts as one.',
            technical: 'Count of PHP-FPM child invocations across the account. Strong correlate of request volume, but doesn\'t include static-file hits served by Nginx.',
            whenItMatters: 'To distinguish "more traffic" from "heavier traffic". Combined with CPU Seconds it tells you whether each request is getting cheaper or more expensive.',
            whereToFind: 'Sites → "Exec" column · Trends → "Program Executions — Daily" · Before/After → "Volume vs Cost"'
        }, {
            key: 'core_pct',
            title: 'Cores in Use (Server CPU)',
            layman: 'How many CPU cores the whole server is using right now. 0.6 cores out of 9 means the server is barely doing anything; 7 out of 9 means it\'s under pressure. The number is the same whether your plan is 7 or 9 cores — it measures actual work, not capacity.',
            technical: 'SiteGround returns the raw value as "% of one core" (0–900% on a 9-core plan). We divide by 100 to get cores in use. SG samples at 15-second resolution. The "daily" value SG returns is the day\'s average (NOT the peak); we derive a peak-from-hourly separately. Cores in use is plan-immune by construction — comparable across plan changes without normalisation.',
            whenItMatters: 'When users are reporting slowness. Sustained ≥75% of plan capacity means requests are queueing and people feel it.',
            whereToFind: 'Health → "Cores in Use" gauge & headroom · Trends → "Cores in Use" daily chart (avg + peak overlay)'
        }, {
            key: 'core_peak',
            title: 'Daily Peak Cores',
            layman: 'The worst hour on each day — how spiky the server got, not just the average.',
            technical: '<code>max(core_hourly) / 100</code> per date — cores in use at the hour of peak. SG\'s "daily" value is an average and can hide a sharp intraday spike. Requires hourly capture.',
            whenItMatters: 'Catching brief overload bursts that an averaging chart would smooth out. Useful when one bad scheduled job or traffic spike causes user-reported slowness.',
            whereToFind: 'Trends → "Cores in Use — Daily" (dashed amber line)'
        }, {
            key: 'mem_combined',
            title: 'Combined Memory (Real + Cache)',
            layman: 'How much of the server\'s memory is in use, including the OS\'s working files. The honest "are we close to running out?" number.',
            technical: '<code>real GB + cache GB</code>, compared against <code>limit GB</code>. Real = process memory (the kind that gets OOM-killed). Cache = filesystem buffer (reclaimable but not free). Above ~75% of plan the OS starts evicting cache and risks an OOM if real grows. Display leads with GB used; "% of plan" shown as subtitle.',
            whenItMatters: 'When the dashboard\'s "Real" alone looks fine (e.g. 4 GB of 14) but combined is at 11 GB — your server has less headroom than it appears.',
            whereToFind: 'Health → "Memory in Use" headroom · Trends → "Memory (GB)" combined line',
            severity: 'good < 60% of plan · watch 60–75% · pressure > 75% (rule of thumb, not from SG docs)'
        }, {
            key: 'headroom',
            title: 'Headroom',
            layman: 'How much you\'ve got left right now — cores free, GB free. Inverse of utilisation but framed as capacity remaining.',
            technical: 'Plan limit minus current consumption. Cores in use is plan-immune, GB used is plan-immune — both are absolute work measurements. Headroom is the same currency: 8.4 of 9 cores free is meaningful regardless of which plan size that is.',
            whenItMatters: 'Pricing/capacity conversations with stakeholders. "We have 8 cores free during peak" is more honest than "we\'re at 11% average".',
            whereToFind: 'Health → headroom strip (top of the tab)'
        }]
    }, {
        section: 'Per-site',
        items: [{
            key: 'cpu_exec_ratio',
            title: 'CPU per Execution',
            layman: 'How heavy each request was on average. Lower is better — it means each page/API call cost less.',
            technical: '<code>cpu_seconds / program_executions</code> at the same granularity. Captures cost-per-request without conflating volume changes.',
            whenItMatters: 'Comparing fixes: if executions stayed the same but CPU dropped, each request got cheaper (a clean optimization). If executions dropped and per-exec stayed the same, you blocked traffic.',
            whereToFind: 'Sites → "CPU/Exec" column · Before/After → "Volume vs Cost" chart'
        }, {
            key: 'burst_score',
            title: 'Burst Score (last 24h)',
            layman: 'Did one bad hour cause all the trouble today, or was it spread out evenly?',
            technical: '<code>peak_hour_cpu / 24h_total</code>. A score of 25% means one hour did a quarter of the day\'s work — typical of cron jobs or scheduled traffic. 8% or less = steady organic.',
            whenItMatters: 'Hunting for misbehaving scheduled tasks or daily traffic peaks. Burst score >25% → check what runs at that hour.',
            whereToFind: 'Sites → "Burst 24h" column',
            severity: 'steady < 10% · spiky 10–25% · burst > 25%'
        }, {
            key: 'activity_class',
            title: 'Activity Class (Before/After)',
            layman: 'A simple label for how a site changed during your comparison window: stable, grew, shrank, just woke up, or went dark.',
            technical: 'NEW: 0 before, &gt;0 after. DIED: &gt;0 before, 0 after. GREW/SHRANK: ±25% threshold. STABLE: within ±25%. INACTIVE: 0 in both. NEW/DIED/INACTIVE are pulled out of the ranking because their %-change is undefined or meaningless.',
            whenItMatters: 'Stops a tiny site going 1→100 CPU from dominating a "+9900%" leaderboard. Surfaces newly-launched and recently-killed sites separately.',
            whereToFind: 'Before/After → "All-Sites Ranking" → Activity column'
        }, {
            key: 'cpu_exec_growth',
            title: 'CPU vs Exec Growth',
            layman: 'Did each request get cheaper or more expensive over the comparison window?',
            technical: '<code>%Δ CPU − %Δ executions</code>. Positive = each request is more expensive now (heavier code path, bigger queries). Negative = each request is cheaper (caching, optimization).',
            whenItMatters: 'Reading the result of a fix more cleanly. Watch for the "executions fell, CPU/exec rose" pattern: it usually means the cheap requests got blocked while expensive ones still run.',
            whereToFind: 'Before/After → "All-Sites Ranking" → "Per-req Δ%" column'
        }, {
            key: 'dead_site',
            title: 'Dead / Parked Site',
            layman: 'A site that exists in your account but isn\'t doing anything — usually staging, suspended, or pointed elsewhere.',
            technical: 'Zero CPU consumption across the entire captured window. Excluded from rankings (no signal). "Quiet" = active fewer than 3 days.',
            whenItMatters: 'Keeps the network-comparison maths honest and the rankings de-cluttered.',
            whereToFind: 'Sites tab → grey dashed "dead" badge'
        }]
    }, {
        section: 'Before/After analytics',
        items: [{
            key: 'control_group',
            title: 'Control Group',
            layman: 'A hand-picked set of unrelated sites to compare against. If they got quieter at the same time your target did, the fix didn\'t cause it — a quiet week did.',
            technical: 'Selectable preset: Auto-top-5, "Unpatched" (snn+einn), LMS Core 4, Non-LMS. Frozen on first run with auto-mode so the comparison stays stable across re-renders.',
            whenItMatters: 'Sense-checking a single-site improvement. A target that drops 30% means nothing if the control also dropped 30%.',
            whereToFind: 'Before/After → "Control Avg Daily" card + green-dashed line on the main chart'
        }, {
            key: 'network_change',
            title: 'Network Change',
            layman: 'Same idea as control group, but using EVERY other site on the account — the broadest possible "what did the whole rest of the network do?" baseline.',
            technical: 'Sum of CPU across every active site except the target, before and after the fix date.',
            whenItMatters: 'A "control group" can be cherry-picked. The network is everyone else — much harder to argue with.',
            whereToFind: 'Before/After → Net Effect hero card → "Network Change" column'
        }, {
            key: 'net_effect',
            title: 'Net Effect (Difference-in-Differences)',
            layman: 'The single most honest answer to "did the fix actually do anything?" It strips out whatever was happening to the rest of the network.',
            technical: 'Target %-change − Network %-change, in percentage points (pp). −15pp = target dropped 15pp more than peers. Near 0 = target moved with the herd.',
            whenItMatters: 'The headline number for presenting fix results to stakeholders. Combined with the credibility score, it\'s the closest you get to a "did this work?" verdict from CPU data alone.',
            whereToFind: 'Before/After → "Net Effect" hero card'
        }, {
            key: 'expected_after',
            title: 'Expected After (Counterfactual)',
            layman: 'How much CPU your target would be using if it had just drifted with the rest of the network — i.e., if the fix had done nothing.',
            technical: '<code>tAvgBefore × (1 + networkPctCh/100)</code>. Compare to actual after-CPU to see "real saving" vs "ambient drift".',
            whenItMatters: 'Converting a percentage win into a concrete number: "we saved 8,400 CPU sec/day vs. the do-nothing counterfactual" is more concrete than "−18%".',
            whereToFind: 'Before/After → Net Effect card → bottom row'
        }, {
            key: 'weekday_paired',
            title: 'Weekday-Paired Analysis',
            layman: 'Compares Mondays to Mondays, Tuesdays to Tuesdays, etc. — so a weekend-heavy "before" doesn\'t make a weekday-heavy "after" look better than it really is.',
            technical: 'Each after-day is matched to a before-day with the same UTC weekday; unmatched days are dropped. Net effect computed only on the matched pairs.',
            whenItMatters: 'Any time your before/after windows have different calendar mixes (very common with short windows around weekends or bank holidays).',
            whereToFind: 'Before/After → "Weekday-paired DiD" card'
        }, {
            key: 'did_residual',
            title: 'DiD Residual t-test',
            layman: 'Asks the right statistical question: "did the target deviate from network drift more than random noise can explain?" Not the same as "did the target\'s number change?"',
            technical: 'Welch\'s t-test comparing the target\'s zero-mean before-residuals to its after-residuals after applying the network growth factor. p &lt; 0.05 = isolated effect is statistically significant.',
            whenItMatters: 'When defending a fix to skeptical audiences. The raw Welch\'s t-test on the target alone can be significant due to network drift; this test screens that out.',
            whereToFind: 'Before/After → Weekday-paired DiD card → bottom row'
        }, {
            key: 'site_rank',
            title: 'Site Rank (All-Sites Ranking)',
            layman: 'How your target site ranked vs every other site on the account, sorted by who improved the most.',
            technical: 'Sorted ascending by %-change. Rank 1 = biggest drop. Percentile = (N − rank) / (N − 1) × 100. NEW/DIED/INACTIVE sites excluded.',
            whenItMatters: 'Stress-testing the fix story. If your target is rank 5 of 20 but most sites also improved, the network move dominated. If it\'s rank 1 of 20 with the others flat, the fix did the work.',
            whereToFind: 'Before/After → "All-Sites Ranking" section'
        }, {
            key: 'credibility',
            title: 'Credibility Score',
            layman: 'How trustworthy this whole Before/After analysis is. 100 = bulletproof; under 50 = collect more data first.',
            technical: 'Composite of: days-after (≥7 = 30pt, 5 = 22pt, 3 = 15pt) + days-before (≥7 = 20pt, etc.) + distinct weekdays matched (20pt) + statistical significance bonus (20pt) − plan-change-straddle penalty (−25pt).',
            whenItMatters: 'Stops you from presenting an "obviously successful fix" that was actually a 2-day fluke crossing a plan upgrade.',
            whereToFind: 'Before/After → Credibility card (top)'
        }]
    }, {
        section: 'Trends & projections',
        items: [{
            key: 'trend7',
            title: '7-Day Trend',
            layman: 'Is this site getting busier or quieter this week compared to last week?',
            technical: '<code>avg(last 7 complete days) / avg(prior 7 complete days) − 1</code>, as a percentage. Partial today is excluded.',
            whenItMatters: 'Early warning. A +50% trend on a heavy site means investigate before the spike becomes an incident.',
            whereToFind: 'Sites → "7d Trend" column · Health → site health snapshot'
        }, {
            key: 'core_pct_trajectory',
            title: 'Cores Trajectory',
            layman: 'A forecast: if the last week\'s trend keeps going, when will the server hit 75% of capacity?',
            technical: 'Linear regression on the last 7 complete days of cores in use. Slope unit is cores/day. <code>days_to_75 = (limit × 0.75 − lastY) / slope</code>. 95% CI from the residual standard error. Cores are plan-immune so the regression doesn\'t need normalisation.',
            whenItMatters: 'Capacity planning. "We have 30 days at this rate" vs "we have 4 days" is the difference between "monitor" and "act now".',
            whereToFind: 'Health → headroom strip → "7d Trajectory" · Trends → bench-strip → Trajectory'
        }, {
            key: 'health_score',
            title: 'Health Score (0–100)',
            layman: 'One number summarising server condition right now: green = fine, amber = watch, red = act.',
            technical: 'Weighted composite: Capacity (40, from live cores vs plan), Trend (20), Anomalies (20), Memory (10, from live GB vs plan), Concentration/HHI (10).',
            whenItMatters: 'A quick-glance check during the day. Drop into the gauges + alerts panel below if you want detail.',
            whereToFind: 'Health → top banner'
        }, {
            key: 'barometer',
            title: 'Load Barometer (last 30 min)',
            layman: 'The most up-to-the-second view of how the server is doing. Refreshes whenever you reload the SiteGround stats panel at 15-second granularity.',
            technical: 'Cores in use at 15-second resolution from <code>step=m3</code> (raw API value / 100). Only the last 30 minutes is available; useful as an "is it bad RIGHT NOW?" probe. 75%-of-plan threshold line scales with plan size.',
            whenItMatters: 'Investigating a live incident or user-reported slowness.',
            whereToFind: 'Health → "CPU Core Barometer" panel'
        }]
    }, {
        section: 'Caveats & corrections',
        items: [{
            key: 'plan_change',
            title: 'Plan Change',
            layman: 'SiteGround changed your account\'s core/RAM allocation mid-period. The dashboard handles this automatically — every metric is in absolute units (cores in use, GB used, CPU seconds), so the same workload appears as the same number regardless of which plan was active.',
            technical: 'Detected from <code>limits_list</code> step-changes. Marked with a vertical purple line on multi-day charts. <strong>Everything on this dashboard is plan-immune:</strong> CPU seconds, program executions, cores in use (raw API value / 100), and memory GB are all absolute counts that don\'t change when the plan does. Only the "% of plan" subtitle next to each absolute reading rescales — a day that used 1.47 cores was 21% of a 7-core plan, now it\'s 16.3% of a 9-core plan. The cores number is unchanged.',
            whenItMatters: 'Never a blocker. Every chart and table is comparable across the plan-change date. The purple marker is purely informational.',
            whereToFind: 'Trends → top banner · Before/After → credibility card · Every multi-day chart marks the date'
        }, {
            key: 'incomplete_day',
            title: 'Partial Day',
            layman: 'Today isn\'t over yet, so we don\'t count it in averages.',
            technical: 'Flagged when today\'s account CPU is &lt;25% of the 7-day rolling average. Excluded from baselines, benchmarks, and Before/After windows.',
            whenItMatters: 'Stops today\'s in-progress total from dragging down comparisons.',
            whereToFind: 'Anywhere a partial-day badge appears'
        }, {
            key: 'tz_note',
            title: 'Timezone Note',
            layman: 'All "day" boundaries on this dashboard are UTC. If you\'re in Ireland, late-night activity around 23:00–00:00 may land on the next day in this view.',
            technical: 'SG\'s API serves UTC timestamps and we currently format dates with <code>toISOString().slice(0,10)</code>. Day-of-week pairing also uses <code>getUTCDay()</code>. No timezone toggle yet.',
            whenItMatters: 'Investigating very specific time-of-day events near midnight Dublin time. Otherwise negligible.',
            whereToFind: 'Everywhere'
        }, {
            key: 'blended_30d',
            title: '30d Averages Across a Plan Change',
            layman: 'No special handling needed — every metric on this dashboard is in absolute units (cores used, GB, CPU seconds), so 30-day averages stay comparable across a plan upgrade automatically.',
            technical: 'The 30d benchmarks read from <code>coresUsedMap</code> (cores in use) and <code>memDailyGbMap</code> (GB) — both plan-immune by construction. No re-expression needed. Trajectory regression also runs on cores; slope unit is cores/day. <code>coreNormMap</code> (% of today\'s plan) and <code>memDailyNormMap</code> are retained for the rare capacity-planning subtitle only.',
            whenItMatters: 'Mostly informational. The "of N cores" or "of N GB" subtitle on every benchmark stays useful even though the underlying number is already plan-immune.',
            whereToFind: 'Trends → bench-strip → "Cores in Use" / "Memory (GB)" items'
        }]
    }, ];
    // EXPLAIN: short plain-English subtitles keyed by metric. Used by the Explain-mode toggle
    // to show a one-liner under each metric/chart title. Derived from GUIDE.layman entries.
    const EXPLAIN = ( () => {
        const m = {};
        GUIDE.forEach(sec => sec.items.forEach(item => m[item.key] = item.layman));
        return m;
    }
    )();
    // Plain-text subtitle helper. Renders the layman explanation as a `.layman-sub` element
    // visible when explain-mode is on. Returns empty string for unknown keys.
    const laymanSub = key => EXPLAIN[key] ? `<div class="layman-sub">${EXPLAIN[key]}</div>` : '';

    const CFG = {
        echartsUrl: 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js',
        lmsCore: ['snnlearn.ie', 'einn.ie', 'lms.cobblestonelearning.com', 'elearninghospicefoundation.ie'],
        unpatched: ['snnlearn.ie', 'einn.ie'],
        defaultTarget: 'lms.cobblestonelearning.com',
        defaultFixDate: ( () => {
            const d = new Date();
            d.setDate(d.getDate() - 2);
            return d.toISOString().slice(0, 10);
        }
        )(),
        defaultDaysBefore: 7,
        defaultDaysAfter: 7,
        // Cobblestone-aligned chart palette: starts with brand cyan + blue, then a balanced spectrum
        // that holds up at 18 distinct site series. Avoids the brand red — that's reserved for criticals.
        palette: ['#27AAE1', '#0074B4', '#2D9E5A', '#FFC20E', '#8A6500', '#7B5EA8', '#E07A35', '#5BC0C7', '#B86E94', '#3D8B3D', '#A8762B', '#5D7DAF', '#84A7C9', '#9DCAA0', '#D4A85C', '#BFB0D6', '#E8B89A', '#7AAEC8'],
    };
    const GROUP_DEFS = {
        lms_core: 'LMS Core (4)',
        top5: 'Top 5',
        top10: 'Top 10',
        cobble: 'Cobblestone',
        active: 'All Active',
        all: 'All Sites'
    };
    // Comparison-group presets, ordered by how often you'll reach for them.
    // - "auto" / "top3"/"top10" — quick CPU-ranked peer groups
    // - "network" — every other active site (broadest baseline, hardest to argue against)
    // - "smallest5" — peer with the long-tail sites (useful for low-traffic targets)
    // - "cobble" — every *.cobblestonelearning.com (same brand, often shared codebase)
    // - "unpatched" / "lms_core" / "non_lms" — Cobblestone-specific hardcoded groups
    // - "custom" — picker modal (user chooses N specific sites)
    const CTRL_PRESETS = {
        auto: 'Auto (Top 5)',
        top3: 'Top 3 by CPU',
        top10: 'Top 10 by CPU',
        smallest5: 'Smallest 5 active',
        similar: 'Similar size (±50% of target)',
        network: 'Whole Network (every other active site)',
        cobble: 'Cobblestone domains (*.cobblestonelearning.com)',
        unpatched: 'Unpatched (snn+einn)',
        lms_core: 'LMS Core 4',
        non_lms: 'Non-LMS',
        custom: 'Custom — pick sites…'
    };
    // Fix Focus: what kind of improvement the user is trying to demonstrate. The hero card,
    // verdict, and primary DiD test all adapt to the chosen metric so the analysis presents
    // the right number first. 'combo' tiles all five for fixes that targeted multiple axes.
    const FOCUS_PRESETS = {
        auto: 'Show everything (default)',
        cost: 'Reduce cost per execution',
        execs: 'Reduce execution volume',
        cpu: 'Reduce CPU time',
        memory: 'Reduce memory usage',
        cores: 'Reduce server-core usage',
        combo: 'Combination (all metrics)'
    };
    // Short label used inside hero cards & narrative copy.
    const FOCUS_LABELS = {
        cost: 'Cost per execution',
        execs: 'Execution volume',
        cpu: 'CPU seconds',
        memory: 'Memory used',
        cores: 'Server cores in use'
    };

    const CAP = {
        sec_daily: null,
        sec_hourly: null,
        core_daily: null,
        core_hourly: null,
        core_3min: null,
        exec_daily: null,
        exec_hourly: null,
        mem_daily: null,
        mem_hourly: null,
        mem_3min: null
    };
    // Reports the dashboard expects before auto-rendering. The user can also click "Open Anyway"
    // to render with whatever subset has arrived (panels missing data show fallback messages).
    const REQUIRED = ['sec_daily', 'sec_hourly', 'exec_daily', 'exec_hourly', 'core_daily', 'core_hourly', 'core_3min', 'mem_daily', 'mem_hourly', 'mem_3min'];
    // Minimum to render anything useful at all (used by "Open Anyway" + refetch-from-perf path)
    const MIN_REQUIRED = ['sec_daily', 'core_daily'];
    const allRequiredCaptured = () => REQUIRED.every(k => CAP[k]);
    const missingCaptures = () => REQUIRED.filter(k => !CAP[k]);
    const minRequiredCaptured = () => MIN_REQUIRED.every(k => CAP[k]);
    let onCaptured = null;
    const S = {
        data: null,
        ui: {
            tab: 'health',
            group: 'lms_core',
            viewStep: 'daily',
            fixDate: CFG.defaultFixDate,
            daysBefore: 7,
            daysAfter: 7,
            target: CFG.defaultTarget,
            ctrlPreset: 'auto',
            frozenCtrl: null,
            sortKey: 'total',
            sortDir: -1,
            charts: {},
            selectedSites: new Set(),
            showAvgLine: true,
            theme: (() => {
                try {
                    return localStorage.getItem('sgd_theme') || 'light';
                } catch {
                    return 'dark';
                }
            }
            )(),
            explain: (() => {
                try {
                    return localStorage.getItem('sgd_explain') !== '0';
                } catch {
                    return true;
                }
            }
            )(),
            // Set of domains the user has chosen to exclude from per-site aggregations.
            // Persisted to localStorage. Server-wide metrics (core %, memory %, live barometers)
            // cannot honour this filter because the SG API only reports those account-wide.
            excludedSites: (() => {
                try {
                    return new Set(JSON.parse(localStorage.getItem('sgd_excluded') || '[]'));
                } catch {
                    return new Set();
                }
            }
            )(),
            // User-picked sites for the "Custom" comparison-group preset. Persisted.
            customCtrl: (() => {
                try {
                    return JSON.parse(localStorage.getItem('sgd_custom_ctrl') || '[]');
                } catch {
                    return [];
                }
            }
            )(),
            // Before/After: which metric the user is trying to demonstrate they improved.
            // Drives the hero card and the per-metric DiD shown most prominently. 'auto' = original
            // 'show everything' behaviour. Persisted so the user's last analysis stance survives reloads.
            fixFocus: (() => {
                try {
                    return localStorage.getItem('sgd_fix_focus') || 'auto';
                } catch {
                    return 'auto';
                }
            }
            )(),
            // Before/After advanced filters
            minActivityCpu: 0,        // Hide peer sites whose before-window CPU/day average is below this
            weekdaysOnly: false,      // Drop Sat/Sun from both windows (and from the matched-pair calc)
            useCustomDates: false,    // Toggles N-days inputs ↔ before-start + after-end date pickers
            customBeforeStart: null,
            customAfterEnd: null
        }
    };
    const persistCustomCtrl = () => {
        try {
            localStorage.setItem('sgd_custom_ctrl', JSON.stringify(S.ui.customCtrl));
        } catch {}
    }
    ;
    const persistFixFocus = () => {
        try {
            localStorage.setItem('sgd_fix_focus', S.ui.fixFocus);
        } catch {}
    }
    ;
    // Pulls the Before/After advanced-filter inputs into the {weekdaysOnly, minActivityCpu,
    // bStart, bEnd, aStart, aEnd} shape buildCmp expects. Shared between the live renderer
    // and the report-generator click handlers so both paths analyse the same window.
    const buildCmpOptsFromUI = fixDate => {
        const weekdaysOnly = !!document.getElementById('cmp-weekdays')?.checked || !!S.ui.weekdaysOnly;
        const minActivityCpu = +(document.getElementById('cmp-minact')?.value || S.ui.minActivityCpu || 0);
        const useCustom = !!S.ui.useCustomDates;
        const cBefStart = document.getElementById('cmp-bstart')?.value || S.ui.customBeforeStart;
        const cAftEnd = document.getElementById('cmp-aend')?.value || S.ui.customAfterEnd;
        const opts = {
            weekdaysOnly,
            minActivityCpu
        };
        if (useCustom && cBefStart) {
            opts.bStart = cBefStart;
            opts.bEnd = addDays(fixDate, -1);
        }
        if (useCustom && cAftEnd) {
            opts.aStart = fixDate;
            opts.aEnd = cAftEnd;
        }
        return opts;
    }
    ;
    const persistExcluded = () => {
        try {
            localStorage.setItem('sgd_excluded', JSON.stringify([...S.ui.excludedSites]));
        } catch {}
    }
    ;
    const isExcluded = dom => S.ui.excludedSites.has(dom);
    const toggleExcluded = dom => {
        if (S.ui.excludedSites.has(dom))
            S.ui.excludedSites.delete(dom);
        else
            S.ui.excludedSites.add(dom);
        persistExcluded();
    }
    ;
    const clearExclusions = () => {
        S.ui.excludedSites.clear();
        persistExcluded();
    }
    ;
    // ECharts colour palette — pulls from CSS variables via getComputedStyle so charts auto-match
    // the live theme. Called at chart-init time, so it stays correct after toggle + re-render.
    const themeChartColors = () => {
        const root = document.getElementById('sgd');
        const fallback = {
            text: '#6e7a87',
            axis: 'rgba(255,255,255,0.08)',
            grid: 'rgba(255,255,255,0.04)',
            tipBg: '#1a2230',
            tipText: '#e8eef5'
        };
        if (!root)
            return fallback;
        const c = getComputedStyle(root);
        return {
            text: c.getPropertyValue('--chart-text').trim() || fallback.text,
            axis: c.getPropertyValue('--chart-axis').trim() || fallback.axis,
            grid: c.getPropertyValue('--chart-grid').trim() || fallback.grid,
            tipBg: c.getPropertyValue('--chart-tooltip-bg').trim() || fallback.tipBg,
            tipText: c.getPropertyValue('--chart-tooltip-text').trim() || fallback.tipText
        };
    }
    ;
    const setTheme = mode => {
        S.ui.theme = mode;
        try {
            localStorage.setItem('sgd_theme', mode);
        } catch {}
        document.getElementById('sgd')?.setAttribute('data-theme', mode);
        document.getElementById('sgd-tt')?.setAttribute('data-theme', mode);
        document.getElementById('sgd-wait-panel')?.setAttribute('data-theme', mode);
        document.getElementById('sgd-drill-overlay')?.querySelector('.drill-modal')?.setAttribute('data-theme', mode);
        // Re-render to refresh ECharts colours
        if (S.data)
            renderTab(S.data);
    }
    ;

    const avg = a => {
        const f = a.map(Number).filter(v => isFinite(v) && v > 0);
        return f.length ? f.reduce( (s, v) => s + v, 0) / f.length : 0;
    }
    ;
    const avgAll = a => {
        const f = a.map(Number).filter(isFinite);
        return f.length ? f.reduce( (s, v) => s + v, 0) / f.length : 0;
    }
    ;
    const pctCh = (b, a) => (b && isFinite(b)) ? ((a - b) / b) * 100 : null;
    const fmtN = v => new Intl.NumberFormat('en-IE').format(Math.round(+v || 0));
    const fmtD = (v, p=2) => isFinite(+v) ? (+v).toFixed(p) : '0.00';
    const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const tsDate = ts => new Date(+ts * 1000).toISOString().slice(0, 10);
    const addDays = (d, n) => {
        const dt = new Date(`${d}T00:00:00Z`);
        dt.setUTCDate(dt.getUTCDate() + n);
        return dt.toISOString().slice(0, 10);
    }
    ;
    const today = () => new Date().toISOString().slice(0, 10);
    const clsCh = v => !isFinite(+v) ? 'cn' : +v <= 0 ? 'cg' : 'cr';
    const signStr = v => v === null ? '—' : ((+v > 0 ? '+' : '') + fmtD(v) + '%');
    const tipAttr = key => `data-tip="${esc(TIPS[key] || '')}"`;
    const tipIcon = key => `<span class="ticon" data-tip="${esc(TIPS[key] || '')}">?</span>`;
    const percentile = (arr, p) => {
        const s = [...arr].filter(v => v > 0).sort( (a, b) => a - b);
        if (!s.length)
            return 0;
        const i = (p / 100) * (s.length - 1);
        const lo = Math.floor(i)
          , hi = Math.ceil(i);
        return s[lo] + (s[hi] - s[lo]) * (i - lo);
    }
    ;

    // ── STATS / BASELINE HELPERS ─────────────────────────────────────────────
    // Median + IQR baseline + 1σ stdev from a site's own 30d daily series.
    // Returns null when the active sample is too small to make sense of (< 5 non-zero days).
    const baseline = vals => {
        const a = vals.filter(v => v > 0);
        if (a.length < 5)
            return null;
        const s = [...a].sort( (x, y) => x - y);
        const q = p => {
            const i = (p / 100) * (s.length - 1)
              , lo = Math.floor(i)
              , hi = Math.ceil(i);
            return s[lo] + (s[hi] - s[lo]) * (i - lo);
        }
        ;
        const med = q(50);
        const p25 = q(25)
          , p75 = q(75)
          , p95 = q(95);
        const mean = a.reduce( (s, v) => s + v, 0) / a.length;
        const variance = a.reduce( (s, v) => s + (v - mean) ** 2, 0) / a.length;
        const sigma = Math.sqrt(variance);
        return {
            med,
            mean,
            p25,
            p75,
            p95,
            iqr: p75 - p25,
            sigma,
            n: a.length,
            // anomaly threshold: max of (μ+2σ, p95×1.2) — robust against both tight and wide distributions
            hi: Math.max(mean + 2 * sigma, p95 * 1.2)
        };
    }
    ;
    // Classify a value against its own baseline: returns {sev, label, ratio}
    // sev: 0 ok, 1 elevated, 2 high, 3 critical
    const classifyVsBaseline = (val, base) => {
        if (!base || !isFinite(val))
            return {
                sev: 0,
                label: '—',
                ratio: null
            };
        const r = base.med > 0 ? val / base.med : null;
        if (val < base.p75)
            return {
                sev: 0,
                label: 'Normal',
                ratio: r
            };
        if (val < base.hi)
            return {
                sev: 1,
                label: 'Elevated',
                ratio: r
            };
        if (val < base.hi * 1.5)
            return {
                sev: 2,
                label: 'High',
                ratio: r
            };
        return {
            sev: 3,
            label: 'Critical',
            ratio: r
        };
    }
    ;
    // Linear regression with explicit x values. Pass parallel xs/ys to preserve real time spacing
    // when you've filtered out zero/missing days — otherwise slope's units don't match real days.
    // Returns {slope, intercept, r2}. slope is in (y-unit) per (x-unit).
    const linReg = (xs, ys) => {
        const n = ys.length;
        if (n < 2 || xs.length !== n)
            return null;
        const mx = xs.reduce( (s, v) => s + v, 0) / n;
        const my = ys.reduce( (s, v) => s + v, 0) / n;
        let num = 0, den = 0, ssTot = 0, ssRes = 0;
        for (let i = 0; i < n; i++) {
            num += (xs[i] - mx) * (ys[i] - my);
            den += (xs[i] - mx) ** 2;
        }
        const slope = den === 0 ? 0 : num / den;
        const intercept = my - slope * mx;
        for (let i = 0; i < n; i++) {
            ssTot += (ys[i] - my) ** 2;
            ssRes += (ys[i] - (slope * xs[i] + intercept)) ** 2;
        }
        const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
        return {
            slope,
            intercept,
            r2
        };
    }
    ;
    // Project forward: returns the index at which y crosses threshold, or null if never within horizon.
    const projectCross = (reg, lastY, threshold, horizonDays=30) => {
        if (!reg || reg.slope <= 0)
            return null;
        const daysFromLast = (threshold - lastY) / reg.slope;
        if (daysFromLast <= 0 || daysFromLast > horizonDays)
            return null;
        return daysFromLast;
    }
    ;
    // 95% confidence interval on a linear regression's slope. Returns {slopeLo, slopeHi, daysCrossLo, daysCrossHi}.
    // Uses the standard error of the slope (residual SD / sqrt(SS_xx)). Conservative on small n.
    const linRegCI = (reg, xs, ys, threshold, lastY) => {
        if (!reg || !xs || xs.length < 3)
            return null;
        const n = xs.length;
        const mx = xs.reduce( (s, v) => s + v, 0) / n;
        const ssXX = xs.reduce( (s, x) => s + (x - mx) ** 2, 0);
        if (ssXX === 0)
            return null;
        const resid = ys.map( (y, i) => y - (reg.slope * xs[i] + reg.intercept));
        const sse = resid.reduce( (s, e) => s + e * e, 0);
        const seSlope = Math.sqrt((sse / (n - 2)) / ssXX);
        // t critical ~ 2.45 for n=6, ~2.31 for n=8, ~2.13 for n=15, ~1.96 large.
        const tCrit = n < 6 ? 2.78 : n < 9 ? 2.31 : n < 15 ? 2.13 : 1.96;
        const slopeLo = reg.slope - tCrit * seSlope;
        const slopeHi = reg.slope + tCrit * seSlope;
        // Translate the slope CI into a "days-to-threshold" CI. If a bound is non-positive, threshold may never be hit on that side.
        const daysFor = sl => {
            if (!isFinite(sl) || sl <= 0 || lastY === undefined)
                return null;
            const d = (threshold - lastY) / sl;
            return d > 0 && d < 365 ? d : null;
        }
        ;
        return {
            slopeLo,
            slopeHi,
            seSlope,
            daysLo: daysFor(slopeHi),
            daysHi: daysFor(slopeLo)
        };
    }
    ;
    // Detect plan-limit step changes inside a limits_list ([{timestamp,value}]).
    // Returns [{date, fromVal, toVal}] sorted ascending, or [] if no change.
    const detectPlanChanges = (limitPts) => {
        if (!limitPts || limitPts.length < 2)
            return [];
        const sorted = [...limitPts].sort( (a, b) => a.timestamp - b.timestamp);
        const out = [];
        let prev = +sorted[0].value;
        for (let i = 1; i < sorted.length; i++) {
            const v = +sorted[i].value;
            if (v !== prev) {
                out.push({
                    date: tsDate(sorted[i].timestamp),
                    fromVal: prev,
                    toVal: v
                });
                prev = v;
            }
        }
        return out;
    }
    ;
    // ISO weekday 0–6 (Sun=0). Used to pair before/after windows by weekday so seasonality washes out.
    const weekdayOf = isoDate => new Date(`${isoDate}T00:00:00Z`).getUTCDay();
    // Two-tailed p-value for Student's t with df degrees of freedom. The body is the exact
    // incomplete-beta expansion welchT used, factored out so the one-sample test shares it.
    const studentTp = (t, df) => {
        if (!isFinite(t) || !isFinite(df) || df <= 0)
            return null;
        // Two-tailed p-value via incomplete beta (Abramowitz & Stegun 26.5.31)
        const ibeta = (x, a, bb) => {
            // continued-fraction expansion for regularised incomplete beta
            const lbeta = (xx, yy) => lgamma(xx) + lgamma(yy) - lgamma(xx + yy);
            const lgamma = z => {
                // Stirling — accurate enough for our purposes (df typically 3..60)
                const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
                let x = z, y = z, tmp = x + 5.5;
                tmp -= (x + 0.5) * Math.log(tmp);
                let ser = 1.000000000190015;
                for (let j = 0; j < 6; j++)
                    ser += g[j] / ++y;
                return -tmp + Math.log(2.5066282746310005 * ser / x);
            }
            ;
            const cf = () => {
                const eps = 3e-7;
                const fpmin = 1e-30;
                let qab = a + bb, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
                if (Math.abs(d) < fpmin)
                    d = fpmin;
                d = 1 / d;
                let h = d;
                for (let m = 1; m < 200; m++) {
                    const m2 = 2 * m;
                    let aa = m * (bb - m) * x / ((qam + m2) * (a + m2));
                    d = 1 + aa * d;
                    if (Math.abs(d) < fpmin)
                        d = fpmin;
                    c = 1 + aa / c;
                    if (Math.abs(c) < fpmin)
                        c = fpmin;
                    d = 1 / d;
                    h *= d * c;
                    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
                    d = 1 + aa * d;
                    if (Math.abs(d) < fpmin)
                        d = fpmin;
                    c = 1 + aa / c;
                    if (Math.abs(c) < fpmin)
                        c = fpmin;
                    d = 1 / d;
                    const del = d * c;
                    h *= del;
                    if (Math.abs(del - 1) < eps)
                        break;
                }
                return h;
            }
            ;
            if (x <= 0)
                return 0;
            if (x >= 1)
                return 1;
            const bt = Math.exp(-lbeta(a, bb) + a * Math.log(x) + bb * Math.log(1 - x));
            if (x < (a + 1) / (a + bb + 2))
                return bt * cf() / a;
            return 1 - bt * (() => {
                // recompute cf with swapped params
                const eps = 3e-7;
                const fpmin = 1e-30;
                const aa2 = bb, bb2 = a, xx = 1 - x;
                let qab = aa2 + bb2, qap = aa2 + 1, qam = aa2 - 1, c = 1, d = 1 - qab * xx / qap;
                if (Math.abs(d) < fpmin)
                    d = fpmin;
                d = 1 / d;
                let h = d;
                for (let m = 1; m < 200; m++) {
                    const m2 = 2 * m;
                    let aaa = m * (bb2 - m) * xx / ((qam + m2) * (aa2 + m2));
                    d = 1 + aaa * d;
                    if (Math.abs(d) < fpmin)
                        d = fpmin;
                    c = 1 + aaa / c;
                    if (Math.abs(c) < fpmin)
                        c = fpmin;
                    d = 1 / d;
                    h *= d * c;
                    aaa = -(aa2 + m) * (qab + m) * xx / ((aa2 + m2) * (qap + m2));
                    d = 1 + aaa * d;
                    if (Math.abs(d) < fpmin)
                        d = fpmin;
                    c = 1 + aaa / c;
                    if (Math.abs(c) < fpmin)
                        c = fpmin;
                    d = 1 / d;
                    const del = d * c;
                    h *= del;
                    if (Math.abs(del - 1) < eps)
                        break;
                }
                return h / aa2;
            }
            )();
        }
        ;
        const x = df / (df + t * t);
        const p = ibeta(x, df / 2, 0.5);
        return p;
    }
    ;
    // One-sample t-test of xs against mu (default 0); two-tailed p via studentTp.
    // Returns {t, df, p, mean, sd, n} or null when n<2 or the sample has no spread.
    const oneSampleT = (xs, mu = 0) => {
        const a = xs.filter(isFinite);
        const n = a.length;
        if (n < 2)
            return null;
        const mean = a.reduce( (s, v) => s + v, 0) / n;
        const variance = a.reduce( (s, v) => s + (v - mean) ** 2, 0) / (n - 1);
        const sd = Math.sqrt(variance);
        // Treat a numerically-flat sample as "no spread": floating-point dust leaves sd at ~1e-16 for
        // identical inputs, which would otherwise explode t into a meaningless p≈0 (false significance).
        const scale = a.reduce( (mx, v) => Math.max(mx, Math.abs(v)), 0);
        if (sd <= 1e-9 * Math.max(scale, 1e-12))
            return null;
        const t = (mean - mu) / (sd / Math.sqrt(n));
        const df = n - 1;
        return { t, df, p: studentTp(t, df), mean, sd, n };
    }
    ;
    // Lag-1 autocorrelation of a series (Pearson of x[t] vs x[t-1]). NaN if <3 points or flat.
    const lag1Acf = xs => {
        const a = xs.filter(isFinite);
        if (a.length < 3)
            return NaN;
        const mn = a.reduce( (s, v) => s + v, 0) / a.length;
        let num = 0, den = 0;
        for (let i = 0; i < a.length; i++)
            den += (a[i] - mn) ** 2;
        for (let i = 1; i < a.length; i++)
            num += (a[i] - mn) * (a[i - 1] - mn);
        return den === 0 ? NaN : num / den;
    }
    ;
    // Welch's t-test: returns {t, df, p, meanA, meanB, diff, ci95: [lo,hi]} or null.
    // p is two-tailed, computed via a series approximation of the t-distribution.
    const welchT = (a, b) => {
        const fa = a.filter(isFinite)
          , fb = b.filter(isFinite);
        if (fa.length < 2 || fb.length < 2)
            return null;
        const ma = fa.reduce( (s, v) => s + v, 0) / fa.length;
        const mb = fb.reduce( (s, v) => s + v, 0) / fb.length;
        const va = fa.reduce( (s, v) => s + (v - ma) ** 2, 0) / (fa.length - 1);
        const vb = fb.reduce( (s, v) => s + (v - mb) ** 2, 0) / (fb.length - 1);
        const se = Math.sqrt(va / fa.length + vb / fb.length);
        if (se === 0)
            return null;
        const t = (mb - ma) / se;
        const df = (va / fa.length + vb / fb.length) ** 2 / ((va / fa.length) ** 2 / (fa.length - 1) + (vb / fb.length) ** 2 / (fb.length - 1));
        // Two-tailed p-value via the shared Student-t helper (studentTp).
        const p = studentTp(t, df);
        // 95% CI on diff using t critical ≈ 1.96 for large df, 2.0 fudge for small samples
        const tCrit = df > 30 ? 1.96 : df > 10 ? 2.1 : 2.45;
        const ci95 = [mb - ma - tCrit * se, mb - ma + tCrit * se];
        return {
            t,
            df,
            p,
            meanA: ma,
            meanB: mb,
            diff: mb - ma,
            ci95
        };
    }
    ;

    // ── HISTORY PERSISTENCE (localStorage) ───────────────────────────────────
    const LS_KEY = 'sgd_history_v1';
    const loadHistory = () => {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        } catch {
            return {};
        }
    }
    ;
    const saveHistory = h => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(h));
        } catch {}
    }
    ;
    // Merge today's rollup into history, keep last 90 days.
    const persistDailyRollup = (data, memData) => {
        const h = loadHistory();
        h.byDate = h.byDate || {};
        data.dates.forEach(d => {
            if (data.incompleteDates.has(d))
                return;
            const row = data.dailyRows.find(r => r.date === d);
            if (!row)
                return;
            const sites = {};
            data.domains.forEach(dom => {
                if (row[dom] > 0)
                    sites[dom] = Math.round(row[dom]);
            }
            );
            h.byDate[d] = {
                acct: Math.round(row.accountCpu),
                core: +row.corePct.toFixed(2),
                cores_used: data.coresUsedMap ? +(data.coresUsedMap.get(d) || 0).toFixed(3) : +(row.corePct / 100).toFixed(3),
                core_limit: row.limit || 9,
                mem: memData?.byDate?.[d] ?? null,
                sites
            };
        }
        );
        // Trim to last 90 days
        const keep = Object.keys(h.byDate).sort().slice(-90);
        h.byDate = Object.fromEntries(keep.map(d => [d, h.byDate[d]]));
        h.updatedAt = new Date().toISOString();
        saveHistory(h);
        return h;
    }
    ;
    // ── Hourly executions rollup ───────────────────────────────────────────────
    // Accumulates ACCOUNT-LEVEL execs per hour-timestamp across visits so the learner-activity weekday
    // heatmap fills in over time (one capture only exposes ~24–48h). Account-level (not per-site) to
    // stay compact: ~35 days × 24h ≈ 840 small ints.
    const HOUR_KEY = 'sgd_hourly_v1';
    const loadHourlyHist = () => {
        try { return JSON.parse(localStorage.getItem(HOUR_KEY) || '{}'); } catch { return {}; }
    }
    ;
    const saveHourlyHist = h => {
        try { localStorage.setItem(HOUR_KEY, JSON.stringify(h)); } catch {}
    }
    ;
    const persistHourlyRollup = () => {
        const sites = CAP.exec_hourly?.data?.aggregated_site_stats_responses;
        if (!sites?.length)
            return loadHourlyHist();
        const h = loadHourlyHist();
        h.byTs = h.byTs || {};
        const tot = new Map();
        for (const s of sites)
            for (const pt of (s.points || [])) {
                const ts = +pt.timestamp;
                tot.set(ts, (tot.get(ts) || 0) + (+pt.value || 0));
            }
        for (const [ts, v] of tot)
            h.byTs[ts] = Math.round(v);
        // Trim to ~35 days behind the latest captured hour.
        const latest = Math.max(...tot.keys());
        const cutoff = latest - 35 * 86400;
        for (const ts of Object.keys(h.byTs))
            if (+ts < cutoff)
                delete h.byTs[ts];
        h.updatedAt = new Date().toISOString();
        saveHourlyHist(h);
        return h;
    }
    ;

    const isIncomplete = (date, rows) => {
        if (date !== today())
            return false;
        const row = rows.find(r => r.date === date);
        if (!row)
            return true;
        const prior = rows.filter(r => r.date !== date && r.accountCpu > 0).slice(-7);
        const roll = avgAll(prior.map(r => r.accountCpu));
        return roll > 0 && row.accountCpu < roll * 0.25;
    }
    ;

    // categorise — case-insensitive on path AND step= value so URL casing variations don't break us.
    const categorise = rawUrl => {
        const u = String(rawUrl).toLowerCase();
        const hasStep = v => u.includes(`step=${v}`);
        if (u.includes('cpu_seconds')) {
            if (hasStep('d'))
                return 'sec_daily';
            if (hasStep('h'))
                return 'sec_hourly';
        }
        if (u.includes('cpu_core_usage')) {
            if (hasStep('m3'))
                return 'core_3min';
            if (hasStep('h'))
                return 'core_hourly';
            if (hasStep('m'))
                return 'core_daily';
        }
        if (u.includes('program_executions')) {
            if (hasStep('d'))
                return 'exec_daily';
            if (hasStep('h'))
                return 'exec_hourly';
        }
        // Memory is served by SG's /stats/ram endpoint (NOT 'memory').
        // Confirmed from a real HAR: https://uapi.siteground.com/.../stats/ram?...&step=m|h|m3
        // Keep the 'memory' branch too in case SG renames it later.
        if (/\/stats\/ram(\?|$)/.test(u) || u.includes('memory')) {
            if (hasStep('m3'))
                return 'mem_3min';
            if (hasStep('h'))
                return 'mem_hourly';
            if (hasStep('m'))
                return 'mem_daily';
        }
        return null;
    }
    ;

    const installInterceptor = () => {
        if (window.__sgdPatched)
            return;
        window.__sgdPatched = true;
        const orig = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : (input?.url || '');
            const res = await orig.apply(this, arguments);
            if (url.includes('uapi.siteground.com')) {
                // Log EVERY uapi hit so we can see exactly which URLs are categorising and which aren't.
                // Look for these in DevTools console while clicking through SG panels.
                const key = categorise(url);
                console.log(`[sgd] uapi ${key || '— UNMATCHED —'} ←`, url);
                if (!key) {
                    console.warn('[sgd] no categorisation; share this URL to fix the matcher:', url);
                }
                try {
                    const data = await res.clone().json();
                    if (data?.status === 200 && key) {
                        const sites = data?.data?.aggregated_site_stats_responses;
                        const pts = data?.data?.points;
                        const nc = sites?.length ?? pts?.length ?? 0;
                        const oc = CAP[key]?.data?.aggregated_site_stats_responses?.length ?? CAP[key]?.data?.points?.length ?? 0;
                        if (!CAP[key] || nc >= oc) {
                            CAP[key] = data;
                            console.log(`[sgd] ✓ captured ${key} (n=${nc}) — ${REQUIRED.filter(k => CAP[k]).length}/${REQUIRED.length} reports`);
                        }
                        updateAvailUI();
                        // Note: we no longer auto-open. User clicks "Open Dashboard" in the wait panel.
                    } else if (data && data.status !== 200) {
                        console.warn(`[sgd] uapi non-200 status (${data.status}) for`, key || url);
                    }
                } catch (err) {
                    console.warn('[sgd] error parsing uapi response for', key, err);
                }
            }
            return res;
        }
        ;
    }
    ;

    const tryRefetchFromPerf = async () => {
        const entries = performance.getEntriesByType('resource').filter(e => e.name.includes('uapi.siteground.com')).sort( (a, b) => b.startTime - a.startTime);
        const byKey = {};
        for (const e of entries) {
            const k = categorise(e.name);
            if (k && !byKey[k])
                byKey[k] = e.name;
        }
        if (!Object.keys(byKey).length)
            return false;
        try {
            await Promise.allSettled(Object.entries(byKey).map(async ([key,url]) => {
                const r = await fetch(url, {
                    credentials: 'include',
                    headers: {
                        accept: 'application/json'
                    }
                });
                if (!r.ok)
                    return;
                const data = await r.json();
                if (data?.status === 200) {
                    CAP[key] = data;
                    console.log('[sgd] perf-refetch', key);
                }
            }
            ));
            updateAvailUI();
            // Only signal "ready" when ALL required captures have been recovered.
            return allRequiredCaptured();
        } catch {
            return false;
        }
    }
    ;

    const buildData = (secRaw, coreRaw, execRaw) => {
        const sites = secRaw.data.aggregated_site_stats_responses || [];
        const acctPts = secRaw.data.points || [];
        const corePts = coreRaw.data.points || [];
        const limitPts = coreRaw.data.limits_list || [];
        const execSites = execRaw?.data?.aggregated_site_stats_responses || [];
        const execPts = execRaw?.data?.points || [];
        const dateSet = new Set();
        acctPts.forEach(p => dateSet.add(tsDate(p.timestamp)));
        corePts.forEach(p => dateSet.add(tsDate(p.timestamp)));
        const dates = [...dateSet].sort();
        // SiteGround emits 2 points per date in cpu_seconds: real value + 0-value at request time. Use max().
        const acctMap = new Map();
        acctPts.forEach(p => {
            const d = tsDate(p.timestamp);
            acctMap.set(d, Math.max(acctMap.get(d) || 0, +p.value));
        }
        );
        const coreMap = new Map();
        corePts.forEach(p => coreMap.set(tsDate(p.timestamp), +p.value));
        const limitMap = new Map();
        limitPts.forEach(p => limitMap.set(tsDate(p.timestamp), +p.value));
        const execAcct = new Map();
        execPts.forEach(p => {
            const d = tsDate(p.timestamp);
            execAcct.set(d, Math.max(execAcct.get(d) || 0, +p.value));
        }
        );
        const siteMap = new Map();
        sites.forEach(s => s.points?.forEach(p => siteMap.set(`${s.domain}|${tsDate(p.timestamp)}`, +p.value)));
        const execMap = new Map();
        execSites.forEach(s => s.points?.forEach(p => execMap.set(`${s.domain}|${tsDate(p.timestamp)}`, +p.value)));
        const sv = (d, date) => siteMap.get(`${d}|${date}`) || 0;
        const ev = (d, date) => execMap.get(`${d}|${date}`) || 0;
        const acctTotal = [...acctMap.values()].reduce( (s, v) => s + v, 0);
        // Compute incomplete-day set up-front (today's partial day, if account CPU is < 25% of 7d rolling avg).
        // Logic mirrors isIncomplete() but reads acctMap directly so we can use it inside the siteStats loop.
        const todayStr = today();
        const incompleteDates = new Set();
        if (dates.includes(todayStr)) {
            const prior = dates.filter(d => d !== todayStr).map(d => acctMap.get(d) || 0).filter(v => v > 0).slice(-7);
            const roll = avgAll(prior);
            if (roll > 0 && (acctMap.get(todayStr) || 0) < roll * 0.25)
                incompleteDates.add(todayStr);
        }
        // Pre-compute the indices of complete days so trend/baseline computation can skip partial days cleanly.
        const completeIdx = dates.map( (d, i) => incompleteDates.has(d) ? -1 : i).filter(i => i >= 0);
        const siteStats = sites.map(site => {
            const vals = dates.map(d => sv(site.domain, d));
            const exVals = dates.map(d => ev(site.domain, d));
            const active = vals.filter(v => v > 0);
            // Use our own sum, not SG's reported total — keeps shareOfAccount internally consistent with acctTotal.
            const total = vals.reduce( (s, v) => s + v, 0);
            const peak = Math.max(0, ...vals);
            const peakDate = peak > 0 ? dates[vals.indexOf(peak)] : '';
            // Use only complete days for last7/prev7 to avoid incomplete-day bias in trend
            const completeVals = completeIdx.map(i => vals[i]);
            const last7 = completeVals.slice(-7)
              , prev7 = completeVals.slice(-14, -7);
            const execTotal = exVals.reduce( (s, v) => s + v, 0);
            const cpuPerExec = execTotal > 0 ? total / execTotal : null;
            const avg30 = avg(active);
            const avg7 = avg(completeVals.slice(-7).filter(v => v > 0));
            // Pass only complete-day values to baseline so today's partial doesn't shift the distribution
            const base = baseline(completeVals);
            const cpuExSeries = vals.map( (v, i) => (exVals[i] > 0 ? v / exVals[i] : 0));
            // Last complete day's value — what we classify against the site's own baseline
            const lastCompleteIdx = completeIdx.length ? completeIdx[completeIdx.length - 1] : null;
            const lastCompleteVal = lastCompleteIdx !== null ? vals[lastCompleteIdx] : 0;
            const lastCompleteDate = lastCompleteIdx !== null ? dates[lastCompleteIdx] : null;
            return {
                domain: site.domain,
                total,
                avg: avg30,
                avg7,
                peak,
                peakDate,
                p75: percentile(vals, 75),
                shareOfAccount: acctTotal ? (total / acctTotal) * 100 : 0,
                trend7: pctCh(avgAll(prev7), avgAll(last7)),
                dailyVals: vals,
                execTotal,
                execDailyVals: exVals,
                cpuPerExec,
                cpuExSeries,
                baseline: base,
                lastCompleteVal,
                lastCompleteDate,
                isDead: total === 0,
                isQuiet: total > 0 && active.length < 3,
                isExcluded: isExcluded(site.domain)
            };
        }
        ).sort( (a, b) => b.total - a.total);
        siteStats.forEach( (s, i) => s.rank = i + 1);
        // ── Per-site burst score from the last 24h hourly data ───────────────
        // burstScore = peak_hour / 24h_total. High score (>25%) = one hour does most of the
        // day's work — typical of cron jobs, scheduled batch processes, or daily traffic peaks.
        // Low score (<8%) = steady burn, suggests evenly spread organic traffic.
        const secHourlySites = CAP.sec_hourly?.data?.aggregated_site_stats_responses || [];
        const burstMap = new Map();
        secHourlySites.forEach(s => {
            const pts = (s.points || []).map(p => +p.value);
            const tot = pts.reduce( (a, b) => a + b, 0);
            const pk = Math.max(0, ...pts);
            if (tot > 50 && pk > 0)
                burstMap.set(s.domain, {
                    burstScore: +(pk / tot * 100).toFixed(1),
                    peakHourCpu: pk,
                    last24hTotal: tot
                });
        }
        );
        siteStats.forEach(s => {
            const b = burstMap.get(s.domain);
            if (b)
                Object.assign(s, b);
        }
        );
        const allDomains = sites.map(s => s.domain);
        const dailyRows = dates.map(date => {
            const row = {
                date,
                accountCpu: acctMap.get(date) || 0,
                corePct: coreMap.get(date) || 0,
                limit: limitMap.get(date) || 9,
                accountExec: execAcct.get(date) || 0
            };
            allDomains.forEach(d => {
                row[d] = sv(d, date);
                row['ex_' + d] = ev(d, date);
            }
            );
            return row;
        }
        );
        // ── Daily PEAK core % derived from hourly data ────────────────────────
        // The /cpu_core_usage step=d response returns the day's AVERAGE, not its peak.
        // When the hourly stream is present we compute max(hourly) per date so we can show
        // the true intraday spike alongside the average — these two numbers can differ 3x.
        const corePeakMap = new Map();
        const coreHourlyRaw = CAP.core_hourly?.data?.points || [];
        coreHourlyRaw.forEach(p => {
            const d = tsDate(p.timestamp);
            corePeakMap.set(d, Math.max(corePeakMap.get(d) || 0, +p.value));
        }
        );
        // ── Core %: raw API value is "% of ONE core" ────────────────────────────
        // SiteGround's cpu_core_usage points[].value is the percentage of a SINGLE
        // core's CPU time used. On a 9-core plan readings can total up to 900%.
        // (Empirical proof: 15-May HAR shows hourly peaks of 121% and daily 147%
        // with limits_list = [9] — impossible under any "% of plan" reading.)
        //
        // Cores in use = pct / 100 — already plan-immune (0.6 cores is 0.6 cores
        // whether the plan is 7 or 9). So coresUsedMap is the canonical series.
        // coreNormMap retained as "% of TODAY'S plan" for the rare capacity-
        // planning subtitle ("are we going to need to upgrade?").
        const currentCoreLimit = limitPts.length ? +limitPts[limitPts.length - 1].value : 9;
        const coresUsedMap = new Map();
        const coreNormMap = new Map();
        const coresPeakUsedMap = new Map();
        const corePeakNormMap = new Map();
        coreMap.forEach( (pct, d) => {
            coresUsedMap.set(d, +(pct / 100).toFixed(3));
            coreNormMap.set(d, +(pct / currentCoreLimit).toFixed(2));
        }
        );
        corePeakMap.forEach( (pct, d) => {
            coresPeakUsedMap.set(d, +(pct / 100).toFixed(3));
            corePeakNormMap.set(d, +(pct / currentCoreLimit).toFixed(2));
        }
        );
        // Benchmarks now in CORES (plan-immune); display layer adds the "of N" context.
        const coreVals = [...coresUsedMap.values()].filter(v => v > 0);
        const acctVals = [...acctMap.values()].filter(v => v > 0);
        // Memory daily series. SG ships RAM data at data.points_series.points_real (GB) plus
        // limits_list (GB). We store both the GB values and the derived % of plan-limit per day.
        const memDailyGbMap = new Map();
        const memDailyCacheMap = new Map();
        const memLimitGbMap = new Map();
        const memDailyMap = new Map();
        // backwards-compat: % of plan limit
        const memRaw = CAP.mem_daily?.data;
        if (memRaw?.points_series?.points_real) {
            memRaw.points_series.points_real.forEach(p => {
                const d = tsDate(p.timestamp);
                memDailyGbMap.set(d, Math.max(memDailyGbMap.get(d) || 0, +p.value));
            }
            );
        }
        if (memRaw?.points_series?.points_cache) {
            memRaw.points_series.points_cache.forEach(p => {
                const d = tsDate(p.timestamp);
                memDailyCacheMap.set(d, Math.max(memDailyCacheMap.get(d) || 0, +p.value));
            }
            );
        }
        if (memRaw?.limits_list) {
            memRaw.limits_list.forEach(p => memLimitGbMap.set(tsDate(p.timestamp), +p.value));
        }
        // Derive % per day = (real GB / plan limit GB) × 100
        memDailyGbMap.forEach( (gb, d) => {
            const lim = memLimitGbMap.get(d);
            if (lim && lim > 0)
                memDailyMap.set(d, +((gb / lim) * 100).toFixed(2));
        }
        );
        const memLimitMap = memLimitGbMap;
        // Memory benchmarks driven by GB values (plan-immune), not by the % series.
        const memGbVals = [...memDailyGbMap.values()].filter(v => v > 0);
        // legacy: still used for hasMem and coverage detection
        const memVals = [...memDailyMap.values()].filter(v => v > 0);
        // ── Combined memory pressure (real + cache) — more honest than 'real' alone ──
        // Process memory (real) is what gets OOM-killed; filesystem cache is reclaimable but
        // tells you the OS is already using the buffer. Combined gives the real "headroom" signal.
        const memCombinedGbMap = new Map();
        const memCombinedMap = new Map();
        memDailyGbMap.forEach( (gb, d) => {
            const cache = memDailyCacheMap.get(d) || 0;
            const lim = memLimitGbMap.get(d);
            memCombinedGbMap.set(d, gb + cache);
            if (lim && lim > 0)
                memCombinedMap.set(d, +(((gb + cache) / lim) * 100).toFixed(2));
        }
        );
        // Capture-completeness: SG's mem_daily often comes back with very few points until the
        // user opens the monthly memory view. Surface this rather than rendering an empty chart.
        const memDailyCoverage = dates.length ? memDailyMap.size / dates.length : 0;
        const memDailyComplete = memDailyCoverage >= 0.5;
        // ── Memory normalization to current plan ──────────────────────────────
        // memDailyGbMap is already absolute (plan-immune). We derive two normalised series so the %
        // line on charts shows "what fraction of TODAY's plan is in use" — comparable across upgrades.
        const memLimGbValues = [...memLimitGbMap.values()];
        const currentMemLimitGb = memLimGbValues.length ? memLimGbValues[memLimGbValues.length - 1] : null;
        const memDailyNormMap = new Map();
        const memCombinedNormMap = new Map();
        if (currentMemLimitGb) {
            memDailyGbMap.forEach( (gb, d) => memDailyNormMap.set(d, +(gb / currentMemLimitGb * 100).toFixed(2)));
            memCombinedGbMap.forEach( (gb, d) => memCombinedNormMap.set(d, +(gb / currentMemLimitGb * 100).toFixed(2)));
        }
        const benchmarks = {
            // Core benchmarks in CORES units (not %). Limit available alongside via currentCoreLimit.
            core: {
                avg30: avgAll(coreVals),
                avg7: avgAll(coreVals.slice(-7)),
                max: coreVals.length ? Math.max(...coreVals) : 0,
                min: coreVals.length ? Math.min(...coreVals.filter(v => v > 0)) : 0
            },
            acct: {
                avg30: avgAll(acctVals),
                avg7: avgAll(acctVals.slice(-7)),
                max: Math.max(0, ...acctVals)
            },
            // Memory benchmarks in GB units (plan-immune); currentMemLimitGb available alongside.
            mem: memGbVals.length ? {
                avg30: avgAll(memGbVals),
                avg7: avgAll(memGbVals.slice(-7)),
                max: Math.max(...memGbVals)
            } : null,
        };
        // Predictive: linear-regression projection from last 7 *complete* days of cores-in-use.
        // We keep the real day index (xs) so the slope's unit is "cores/day", not "cores/non-zero-sample".
        // Cores are plan-immune so the regression is automatically comparable across plan changes —
        // no normalisation step needed.
        const last7Idx = completeIdx.slice(-7);
        const last7xs = last7Idx.map(i => i)
          , last7ys = last7Idx.map(i => coresUsedMap.get(dates[i]) || 0);
        // Filter zero entries via parallel arrays so xs/ys stay aligned
        const xs = [], ys = [];
        for (let i = 0; i < last7xs.length; i++) {
            if (last7ys[i] > 0) {
                xs.push(last7xs[i]);
                ys.push(last7ys[i]);
            }
        }
        const coreLim = currentCoreLimit;
        const coreReg = linReg(xs, ys);
        // Last actual y for projection start
        const lastY = ys.length ? ys[ys.length - 1] : 0;
        const lastX = xs.length ? xs[xs.length - 1] : 0;
        const coreProjCI = coreReg ? linRegCI(coreReg, xs, ys, coreLim * 0.75, lastY) : null;
        const coreProj = coreReg ? {
            reg: coreReg,
            lastX,
            lastY,
            daysTo75: projectCross(coreReg, lastY, coreLim * 0.75),
            daysTo90: projectCross(coreReg, lastY, coreLim * 0.9),
            ci: coreProjCI,
            sampleN: xs.length
        } : null;
        // ── Plan-change detection — when did SG upgrade/downgrade cores or memory? ──
        // Each entry: {date, fromVal, toVal, kind}. Used for chart markers, normalisation,
        // and warnings when a Before/After window straddles a change (the comparison would
        // otherwise be silently apples-to-oranges).
        const planChanges = [...detectPlanChanges(limitPts).map(c => ({
            ...c,
            kind: 'core'
        })), ...detectPlanChanges(CAP.mem_daily?.data?.limits_list || []).map(c => ({
            ...c,
            kind: 'mem'
        })), ];
        return {
            dates,
            siteStats,
            dailyRows,
            acctMap,
            coreMap,
            corePeakMap,
            coresUsedMap,
            coreNormMap,
            coresPeakUsedMap,
            corePeakNormMap,
            currentCoreLimit,
            limitMap,
            memDailyMap,
            memDailyGbMap,
            memDailyCacheMap,
            memCombinedMap,
            memCombinedGbMap,
            memDailyNormMap,
            memCombinedNormMap,
            currentMemLimitGb,
            memLimitMap,
            memLimitGbMap,
            memDailyComplete,
            memDailyCoverage,
            execAcct,
            sv,
            ev,
            domains: allDomains,
            acctTotal,
            incompleteDates,
            hasExec: execSites.length > 0,
            hasMem: memVals.length > 0,
            hasCorePeak: corePeakMap.size > 0,
            hasBurst: burstMap.size > 0,
            benchmarks,
            coreProj,
            planChanges,
            deadSites: siteStats.filter(s => s.isDead).map(s => s.domain),
            activeSites: siteStats.filter(s => !s.isDead).map(s => s.domain)
        };
    }
    ;

    const buildHourlyData = () => {
        const sec = CAP.sec_hourly
          , core = CAP.core_hourly;
        if (!sec || !core)
            return null;
        const sites = sec.data.aggregated_site_stats_responses || [];
        const corePts = core.data.points || [];
        const lims = core.data.limits_list || [];
        const secPts = sec.data.points || [];
        const maxLimit = lims.length ? Math.max(...lims.map(p => +p.value)) : 9;
        const fmt = ts => new Date(+ts * 1000).toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return {
            sites,
            corePts,
            secPts,
            maxLimit,
            coreLabels: corePts.map(p => fmt(p.timestamp)),
            // coreVals retained as raw API values (% of one core) for legacy callers.
            // coresVals is the canonical series: cores in use (= raw / 100), plan-immune.
            coreVals: corePts.map(p => +(+p.value).toFixed(2)),
            coresVals: corePts.map(p => +((+p.value) / 100).toFixed(3)),
            secLabels: secPts.map(p => fmt(p.timestamp))
        };
    }
    ;
    // ── Learner-activity rhythm ────────────────────────────────────────────────
    // Hourly program-executions are the closest infra proxy we have for "how many learners are on
    // the platform right now". This buckets every captured hourly exec point into an
    // hour-of-day × weekday cell and returns the AVERAGE executions per slot (avg, not sum, so uneven
    // coverage across weeks doesn't distort the picture), plus the single busiest slot. `domains`
    // optionally restricts it to one tenant/brand. Returns null when no hourly exec data was captured.
    // Weekday/hour use the browser's local time = the admin's (and learners') timezone, which is the
    // whole point: we want to know when *people* are studying, not UTC.
    const buildActivityMatrix = (domains = null) => {
        const sites = CAP.exec_hourly?.data?.aggregated_site_stats_responses || [];
        const want = domains ? new Set(domains) : null;
        // Collapse to one execs-total per distinct timestamp across the wanted sites first, so each
        // real hour is a single observation before we bucket it by weekday/hour.
        const byTs = new Map();
        for (const s of sites) {
            if (want && !want.has(s.domain))
                continue;
            for (const pt of (s.points || [])) {
                const ts = +pt.timestamp;
                byTs.set(ts, (byTs.get(ts) || 0) + (+pt.value || 0));
            }
        }
        // Enrich the all-sites view with the accumulated account-level hourly rollup so the weekday
        // matrix fills in over repeat visits (one capture only exposes ~24–48h). Tenant-scoped views
        // stay on live per-site data only, since the rollup is account-level.
        if (!want) {
            const hist = loadHourlyHist().byTs;
            if (hist)
                for (const ts in hist)
                    if (!byTs.has(+ts))
                        byTs.set(+ts, hist[ts]);
        }
        if (!byTs.size)
            return null;
        const sum = Array.from({ length: 7 }, () => new Array(24).fill(0));
        const cnt = Array.from({ length: 7 }, () => new Array(24).fill(0));
        for (const [ts, v] of byTs) {
            const d = new Date(ts * 1000);
            sum[d.getDay()][d.getHours()] += v;
            cnt[d.getDay()][d.getHours()] += 1;
        }
        const avg = sum.map((row, w) => row.map((sv, h) => cnt[w][h] ? sv / cnt[w][h] : null));
        let peak = { w: 0, h: 0, v: -1 }, gSum = 0, gCnt = 0, max = 0;
        for (let w = 0; w < 7; w++)
            for (let h = 0; h < 24; h++) {
                const v = avg[w][h];
                if (v === null)
                    continue;
                gSum += v;
                gCnt += 1;
                if (v > max)
                    max = v;
                if (v > peak.v)
                    peak = { w, h, v };
            }
        // Hour-of-day collapse — robust even when only ~1–2 days of hourly data were captured
        // (SiteGround's hourly endpoints only expose ~24–48h per capture; the full weekday matrix
        // only fills in once an hourly rollup has accumulated across visits).
        const sumH = new Array(24).fill(0), cntH = new Array(24).fill(0), wkSeen = new Set();
        for (const [ts, v] of byTs) {
            const d = new Date(ts * 1000);
            sumH[d.getHours()] += v;
            cntH[d.getHours()] += 1;
            wkSeen.add(d.getDay());
        }
        const hourProfile = sumH.map((sv, h) => cntH[h] ? sv / cntH[h] : null);
        let peakHour = { h: 0, v: -1 };
        hourProfile.forEach((v, h) => { if (v !== null && v > peakHour.v) peakHour = { h, v }; });
        return {
            avg, max, peak: peak.v >= 0 ? peak : null, mean: gCnt ? gSum / gCnt : 0, slots: gCnt,
            hourProfile, peakHour: peakHour.v >= 0 ? peakHour : null, weekdaysCovered: wkSeen.size
        };
    }
    ;
    // Companion to buildActivityMatrix: average CORES IN USE per hour-of-day × weekday (account-wide,
    // plan-immune). Lets a view answer "at the busiest learning hour, how much headroom is left?".
    const buildCoreHourMatrix = () => {
        const pts = CAP.core_hourly?.data?.points;
        if (!pts?.length)
            return null;
        const sum = Array.from({ length: 7 }, () => new Array(24).fill(0));
        const cnt = Array.from({ length: 7 }, () => new Array(24).fill(0));
        for (const pt of pts) {
            const d = new Date(+pt.timestamp * 1000);
            sum[d.getDay()][d.getHours()] += (+pt.value || 0) / 100; // raw % of one core → cores
            cnt[d.getDay()][d.getHours()] += 1;
        }
        const avg = sum.map((row, w) => row.map((sv, h) => cnt[w][h] ? sv / cnt[w][h] : null));
        return { avg, limit: getCoreLimit() };
    }
    ;
    // Returns the RAW SG API value ("% of one core", can total up to n_cores × 100%).
    // Use this only for displaying the SG-console number verbatim. For any calculation,
    // use getLiveCores() instead — that returns the value in cores (plan-immune).
    const getLiveCore = () => {
        if (CAP.core_3min?.data?.points?.length) {
            const pts = CAP.core_3min.data.points;
            return +(pts[pts.length - 1].value).toFixed(2);
        }
        if (CAP.core_hourly?.data?.points?.length) {
            const pts = CAP.core_hourly.data.points;
            return +(pts[pts.length - 1].value).toFixed(2);
        }
        return null;
    }
    ;
    // Cores in use right now (raw / 100). This is the canonical unit for every
    // calculation, threshold, gauge, and chart — plan-immune by construction.
    const getLiveCores = () => {
        const raw = getLiveCore();
        return raw === null ? null : +(raw / 100).toFixed(3);
    }
    ;
    const getCoreLimit = () => {
        const lims = CAP.core_daily?.data?.limits_list || [];
        return lims.length ? Math.max(...lims.map(p => +p.value)) : 9;
    }
    ;
    // Memory live value: SG returns data at data.points_series.points_real (GB).
    // We expose both raw GB and the derived % of plan limit, so renderers can pick the unit they need.
    const getLiveMemGb = () => {
        const src = CAP.mem_3min?.data || CAP.mem_hourly?.data || CAP.mem_daily?.data;
        const pts = src?.points_series?.points_real;
        if (!pts?.length)
            return null;
        return +(+pts[pts.length - 1].value).toFixed(2);
    }
    ;
    const getMemLimit = () => {
        const lims = CAP.mem_3min?.data?.limits_list || CAP.mem_hourly?.data?.limits_list || CAP.mem_daily?.data?.limits_list || [];
        if (!lims.length)
            return null;
        // Most recent limit is the current plan capacity (limits can change after upgrade)
        return +lims[lims.length - 1].value;
    }
    ;
    const getLiveMem = () => {
        const gb = getLiveMemGb();
        const lim = getMemLimit();
        if (gb === null || !lim)
            return null;
        return +((gb / lim) * 100).toFixed(2);
    }
    ;
    // SG's hourly series last point is the *current partial hour* (hour-to-date), not the most recent complete hour.
    const lastCompleteHourly = points => {
        if (!points?.length)
            return 0;
        if (points.length === 1)
            return +points[0].value || 0;
        return +points[points.length - 2].value || 0;
    }
    ;
    const buildMemoryHourly = () => {
        const m = CAP.mem_hourly?.data;
        const pts = m?.points_series?.points_real;
        if (!pts?.length)
            return null;
        const lim = m.limits_list?.length ? +m.limits_list[m.limits_list.length - 1].value : null;
        const fmt = ts => new Date(+ts * 1000).toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return {
            labels: pts.map(p => fmt(p.timestamp)),
            gbVals: pts.map(p => +(+p.value).toFixed(2)),
            vals: lim ? pts.map(p => +(((+p.value) / lim) * 100).toFixed(2)) : pts.map(p => +(+p.value).toFixed(2)),
            limit: lim ? 100 : null,
            limitGb: lim
        };
    }
    ;

    // Primary suspect: the single site contributing most to current pressure.
    // Score = last-complete-hour CPU × site share × max(1, ratio vs its own 7d hourly baseline).
    // Uses the *last complete hour* (not the current partial hour) so the ratio isn't biased low.
    // Returns null if hourly data unavailable.
    const findPrimarySuspect = (data, h) => {
        if (!h)
            return null;
        const ranked = h.sites.map(s => {
            const lastHr = lastCompleteHourly(s.points);
            const site = data.siteStats.find(x => x.domain === s.domain);
            const share = site?.shareOfAccount || 0;
            const expHr = site?.avg7 ? site.avg7 / 24 : 0;
            const ratio = expHr > 0 ? lastHr / expHr : 0;
            const score = lastHr * Math.max(1, ratio) * (share + 1);
            return {
                domain: s.domain,
                lastHr,
                share,
                expHr,
                ratio,
                score,
                site
            };
        }
        ).filter(x => x.lastHr > 0).sort( (a, b) => b.score - a.score);
        return ranked[0] || null;
    }
    ;
    // Composite health score (0–100). Weights:
    //   capacity (40): live cores in use vs plan limit
    //   trend (20): direction over last 7 days
    //   anomalies (20): count + severity of warn/crit alerts
    //   memory (10): live mem vs plan limit
    //   concentration (10): HHI of site CPU share — penalise one site dominating
    // Weights centralised + justified here so the 0–100 score is tunable, not magic literals (sum=100).
    // Capacity dominates because a saturated plan is the only thing that actually throttles learners;
    // memory/concentration are smaller because they are slower-moving, second-order risks.
    const HEALTH_WEIGHTS = { capacity: 40, trend: 20, anomalies: 20, memory: 10, concentration: 10 };
    const computeHealthScore = (data, alerts) => {
        const W = HEALTH_WEIGHTS;
        const parts = {};
        const liveCores = getLiveCores();
        const coreLim = getCoreLimit();
        // capacity: 40 at 0 cores, 0 at coreLim cores (full plan saturated)
        const coreLoad = (liveCores !== null && coreLim) ? Math.min(1, liveCores / coreLim) : 0;
        parts.capacity = Math.max(0, W.capacity * (1 - coreLoad));
        // trend: based on weekly drift in account CPU
        const acctDates = data.dates.filter(d => !data.incompleteDates.has(d));
        const last7 = acctDates.slice(-7).map(d => data.acctMap.get(d) || 0);
        const prev7 = acctDates.slice(-14, -7).map(d => data.acctMap.get(d) || 0);
        const trend = pctCh(avgAll(prev7), avgAll(last7));
        parts.trend = (trend === null || trend < -10) ? W.trend : trend < 10 ? W.trend * 0.8 : trend < 30 ? W.trend * 0.5 : trend < 60 ? W.trend * 0.2 : 0;
        // anomalies
        const warns = alerts.filter(a => a.lvl === 'warn').length;
        const crits = alerts.filter(a => a.lvl === 'crit').length;
        parts.anomalies = Math.max(0, W.anomalies - warns * 4 - crits * 10);
        // memory: getLiveMem() already returns "% of plan" (0–100)
        const liveMemPct = getLiveMem();
        if (liveMemPct !== null) {
            parts.memory = Math.max(0, W.memory * (1 - liveMemPct / 100));
        } else {
            parts.memory = W.memory * 0.7;
            // partial credit when unmeasured
        }
        // concentration: HHI of shareOfAccount² / 10000 (higher = more concentrated)
        const shares = data.siteStats.filter(s => s.total > 0).map(s => s.shareOfAccount);
        const hhi = shares.reduce( (s, v) => s + v * v, 0) / 10000;
        // hhi 0..1
        parts.concentration = Math.max(0, W.concentration * (1 - hhi));
        const total = Math.round(parts.capacity + parts.trend + parts.anomalies + parts.memory + parts.concentration);
        return {
            score: Math.max(0, Math.min(100, total)),
            parts
        };
    }
    ;

    const buildAlerts = (data, h) => {
        const alerts = [];
        const liveCores = getLiveCores();
        const limit = getCoreLimit();
        const liveMemGb = getLiveMemGb();
        const memLim = getMemLimit();
        if (liveMemGb !== null && memLim) {
            const memPct = (liveMemGb / memLim) * 100;
            if (memPct > 85)
                alerts.push({
                    lvl: 'crit',
                    msg: `Memory at <strong>${liveMemGb.toFixed(2)} GB</strong> of ${memLim} GB (${memPct.toFixed(0)}% of plan). OOM risk imminent.`
                });
            else if (memPct > 70)
                alerts.push({
                    lvl: 'warn',
                    msg: `Memory elevated at <strong>${liveMemGb.toFixed(2)} GB</strong> of ${memLim} GB (${memPct.toFixed(0)}% of plan). Watch for OOM kills.`
                });
        }
        // Predictive trajectory alert — coreProj fields are in CORES (cores/day slope, cores threshold).
        if (data.coreProj?.daysTo75 && data.coreProj.daysTo75 < 14) {
            const threshold = (limit * 0.75).toFixed(2);
            alerts.push({
                lvl: data.coreProj.daysTo75 < 5 ? 'crit' : 'warn',
                msg: `Trend projection: hitting <strong>${threshold} cores (75% of ${limit}-core plan) in ~${data.coreProj.daysTo75.toFixed(1)} days</strong> if current trajectory continues (r²=${data.coreProj.reg.r2.toFixed(2)}).`
            });
        }
        if (liveCores !== null && limit) {
            const pctLim = (liveCores / limit) * 100;
            const coresStr = `<strong>${liveCores.toFixed(2)} of ${limit} cores</strong>`;
            if (pctLim > 80)
                alerts.push({
                    lvl: 'crit',
                    msg: `Server using ${coresStr} (${pctLim.toFixed(0)}% of plan) — exceeds 80% saturation. Users may be experiencing slowdowns right now.`
                });
            else if (pctLim > 60)
                alerts.push({
                    lvl: 'warn',
                    msg: `Server using ${coresStr} elevated (${pctLim.toFixed(0)}% of plan). Monitor over next 30 minutes.`
                });
            else
                alerts.push({
                    lvl: 'ok',
                    msg: `Server using ${coresStr} (${pctLim.toFixed(0)}% of plan) — well within capacity.`
                });
        }
        if (h) {
            const top = h.sites.slice().sort( (a, b) => lastCompleteHourly(b.points) - lastCompleteHourly(a.points)).slice(0, 4);
            top.forEach(s => {
                const lastHr = lastCompleteHourly(s.points);
                const site = data.siteStats.find(x => x.domain === s.domain);
                const vs7d = site?.avg7 || 0;
                if (lastHr > 0 && vs7d > 0) {
                    const ratio = lastHr / (vs7d / 24);
                    if (ratio >= 3)
                        alerts.push({
                            lvl: 'crit',
                            msg: `<strong>${esc(s.domain)}</strong>: <strong>${fmtN(lastHr)}</strong> CPU sec last hour — ${ratio.toFixed(1)}× its hourly 7d average.`
                        });
                    else if (ratio >= 1.75)
                        alerts.push({
                            lvl: 'warn',
                            msg: `<strong>${esc(s.domain)}</strong> running ${ratio.toFixed(1)}× above its 7d hourly average (${fmtN(lastHr)} vs avg ${fmtN(vs7d / 24)}).`
                        });
                }
            }
            );
        }
        data.siteStats.filter(s => s.total > 0 && s.trend7 !== null).forEach(s => {
            if (s.trend7 > 50 && s.avg7 > 2000)
                alerts.push({
                    lvl: 'warn',
                    msg: `<strong>${esc(s.domain)}</strong> 7-day trend: <span class="cr">+${fmtD(s.trend7)}%</span> — CPU climbing week-on-week.`
                });
            if (s.trend7 < -30)
                alerts.push({
                    lvl: 'ok',
                    msg: `<strong>${esc(s.domain)}</strong> trending down <span class="cg">${signStr(s.trend7)}</span> over 7 days — CPU reducing.`
                });
        }
        );
        return alerts.slice(0, 8);
    }
    ;

    const resolveCtrl = (data, target, preset) => {
        // Active candidates excludes the target itself, dead sites, and user-excluded sites.
        // `siteStats` is pre-sorted descending by total CPU so .slice(0,N) picks heaviest peers.
        const active = data.siteStats.filter(s => s.domain !== target && s.total > 0 && !s.isExcluded);
        if (preset === 'auto')
            return active.slice(0, 5).map(s => s.domain);
        if (preset === 'top3')
            return active.slice(0, 3).map(s => s.domain);
        if (preset === 'top10')
            return active.slice(0, 10).map(s => s.domain);
        if (preset === 'smallest5')
            return active.slice(-5).map(s => s.domain);
        if (preset === 'similar') {
            // "Like-for-like" peers: every active site whose total-window CPU falls within
            // ±50% of the target's. Caps at 12 closest matches to keep the DiD comparable
            // and the chart readable. If target has 0 CPU (edge case), fall back to top 5.
            const tStat = data.siteStats.find(s => s.domain === target);
            const tTot = tStat?.total || 0;
            if (tTot <= 0)
                return active.slice(0, 5).map(s => s.domain);
            const lo = tTot * 0.5
              , hi = tTot * 1.5;
            return active.filter(s => s.total >= lo && s.total <= hi).slice()
                .sort( (a, b) => Math.abs(a.total - tTot) - Math.abs(b.total - tTot))
                .slice(0, 12).map(s => s.domain);
        }
        if (preset === 'network')
            return active.map(s => s.domain);
        if (preset === 'cobble')
            return active.filter(s => s.domain.endsWith('.cobblestonelearning.com')).map(s => s.domain);
        if (preset === 'unpatched')
            return CFG.unpatched.filter(d => d !== target && data.domains.includes(d) && !isExcluded(d));
        if (preset === 'lms_core')
            return CFG.lmsCore.filter(d => d !== target && data.domains.includes(d) && !isExcluded(d));
        if (preset === 'non_lms')
            return active.filter(s => !CFG.lmsCore.includes(s.domain)).slice(0, 5).map(s => s.domain);
        if (preset === 'custom')
            return (S.ui.customCtrl || []).filter(d => d !== target && data.domains.includes(d) && !isExcluded(d));
        return active.slice(0, 5).map(s => s.domain);
    }
    ;
    const groupSites = (data, group) => {
        // All group selectors filter excluded sites out. The Sites tab table renders excluded
        // sites separately (greyed-out) so users can un-exclude them; chart-eligible groups omit.
        const s = data.siteStats.filter(x => !x.isExcluded);
        if (group === 'lms_core')
            return s.filter(x => CFG.lmsCore.includes(x.domain));
        if (group === 'top5')
            return s.slice(0, 5);
        if (group === 'top10')
            return s.slice(0, 10);
        if (group === 'cobble')
            return s.filter(x => x.domain.endsWith('.cobblestonelearning.com'));
        if (group === 'active')
            return s.filter(x => x.total > 0);
        return s;
    }
    ;

    const buildCmp = (data, target, fixDate, daysBefore, daysAfter, ctrlDoms, opts = {}) => {
        // opts can override the implicit ±N-days window with absolute date strings, drop
        // weekends entirely from both windows, and prune low-activity peers from the network.
        // All three are wired through Before/After's "Advanced filters" row.
        const bStart = opts.bStart || addDays(fixDate, -daysBefore)
          , bEnd = opts.bEnd || addDays(fixDate, -1);
        const aStart = opts.aStart || fixDate
          , aEnd = opts.aEnd || addDays(fixDate, daysAfter - 1);
        const weekdaysOnly = !!opts.weekdaysOnly;
        const minAct = +(opts.minActivityCpu || 0);
        const isBusinessDay = d => {
            const w = weekdayOf(d);
            return w !== 0 && w !== 6;
        }
        ;
        const dateFilter = d => !data.incompleteDates.has(d) && (!weekdaysOnly || isBusinessDay(d));
        const bDates = data.dates.filter(d => d >= bStart && d <= bEnd && dateFilter(d));
        const aDates = data.dates.filter(d => d >= aStart && d <= aEnd && dateFilter(d));
        const tB = bDates.map(d => data.sv(target, d))
          , tA = aDates.map(d => data.sv(target, d));
        const cB = bDates.map(d => ctrlDoms.reduce( (s, cd) => s + data.sv(cd, d), 0));
        const cA = aDates.map(d => ctrlDoms.reduce( (s, cd) => s + data.sv(cd, d), 0));
        const aB = bDates.map(d => data.acctMap.get(d) || 0)
          , aA = aDates.map(d => data.acctMap.get(d) || 0);
        // Server cores in use per day (plan-immune by construction — no normalisation needed)
        const kB = bDates.map(d => data.coresUsedMap.get(d) || 0)
          , kA = aDates.map(d => data.coresUsedMap.get(d) || 0);
        const eB = bDates.map(d => data.ev(target, d))
          , eA = aDates.map(d => data.ev(target, d));
        // Memory daily peak GB (plan-immune)
        const mB = bDates.map(d => data.memDailyGbMap?.get(d) || 0)
          , mA = aDates.map(d => data.memDailyGbMap?.get(d) || 0);
        const cpuExB = eB.reduce( (s, v) => s + v, 0) > 0 ? tB.reduce( (s, v) => s + v, 0) / eB.reduce( (s, v) => s + v, 0) : null;
        const cpuExA = eA.reduce( (s, v) => s + v, 0) > 0 ? tA.reduce( (s, v) => s + v, 0) / eA.reduce( (s, v) => s + v, 0) : null;
        // ── Network-wide aggregation (every active site except target) ─────────
        // The "control group" is a small curated sample; the "network" is every other site.
        // We use it to compute a difference-in-differences (DiD) net effect: the share of
        // the target's improvement that wasn't simply ambient drift across the whole account.
        // User-excluded sites are dropped from the network — they're treated as if they don't exist.
        // When minAct > 0 also drop sites whose before-window avg CPU/day is below the threshold:
        // a 5 → 50 CPU sec/day swing looks like +900% but is noise; min-activity keeps the DiD
        // numerically stable.
        const networkDoms = data.siteStats.filter(s => {
            if (s.domain === target || s.total <= 0 || s.isExcluded)
                return false;
            if (minAct > 0) {
                const bAvg = avgAll(bDates.map(d => data.sv(s.domain, d)));
                if (bAvg < minAct)
                    return false;
            }
            return true;
        }
        ).map(s => s.domain);
        const nB = bDates.map(d => networkDoms.reduce( (s, dd) => s + data.sv(dd, d), 0));
        const nA = aDates.map(d => networkDoms.reduce( (s, dd) => s + data.sv(dd, d), 0));
        const tAvgB = avgAll(tB)
          , tAvgA = avgAll(tA);
        const nAvgB = avgAll(nB)
          , nAvgA = avgAll(nA);
        const targetPctCh = pctCh(tAvgB, tAvgA);
        const networkPctCh = pctCh(nAvgB, nAvgA);
        // ── Baseline = the user's SELECTED comparison group (ctrlDoms) ──────────────
        // The headline verdict (Net Effect, paired DiD, significance, credibility) is graded
        // against the group the user picked in "Compare Against", NOT the whole network. The
        // whole network stays computed as a labelled CONTEXT reference. When the selected group
        // IS the whole network (preset "network", or "auto" happening to equal it), the two
        // coincide and behaviour is identical to before — that's the regression anchor.
        const cAvgB = avgAll(cB)
          , cAvgA = avgAll(cA);
        const controlPctCh = pctCh(cAvgB, cAvgA);
        const ctrlIsNetwork = ctrlDoms.length === networkDoms.length && ctrlDoms.every(d => networkDoms.includes(d));
        // baselinePctCh drives every verdict below. Falls back to the network only when the
        // selected group is empty (e.g. min-activity pruned everything), so a verdict still renders.
        const baselinePctCh = (controlPctCh !== null) ? controlPctCh : networkPctCh;
        // ── Three-lens summary: executions, CPU seconds, time-per-execution ────────
        // Each lens computes the "per day" metric for target, control group, and network,
        // then a % change before→after. Per-day averaging is critical: if the user picks
        // 14d-before / 7d-after, sum-over-window would falsely report -50% even when
        // daily traffic was identical. Averages are window-length-independent.
        //
        // Combined, the three lenses tell the full fix story:
        //   - executions ↓ only            → blocked traffic, didn't fix code
        //   - CPU sec ↓ but exec flat      → cheaper requests (good)
        //   - CPU sec ↓ and exec ↓ equally → traffic drop only, ambiguous fix verdict
        //   - cost/exec ↓ while exec ↑    → server got faster despite more load
        // Comparing each lens against control and network distinguishes site-specific
        // effects from account-wide ambient drift.
        const sum = arr => arr.reduce( (s, v) => s + v, 0);
        const groupExec = (dates_, doms) => dates_.map(d => doms.reduce( (s, dd) => s + data.ev(dd, d), 0));
        const cExecB = groupExec(bDates, ctrlDoms)
          , cExecA = groupExec(aDates, ctrlDoms);
        const nExecB = groupExec(bDates, networkDoms)
          , nExecA = groupExec(aDates, networkDoms);
        const safePctCh = (a, b) => (a > 0 && isFinite(a) && isFinite(b)) ? ((b - a) / a) * 100 : null;
        const lenses = {
            // Executions: AVG daily request volume per group.
            exec: {
                label: 'Executions / day',
                unit: 'requests',
                tip: 'program_executions',
                tgtBefore: avgAll(eB),
                tgtAfter: avgAll(eA),
                ctrlBefore: avgAll(cExecB),
                ctrlAfter: avgAll(cExecA),
                netBefore: avgAll(nExecB),
                netAfter: avgAll(nExecA)
            },
            // CPU seconds: AVG daily CPU consumed per group.
            cpu: {
                label: 'CPU Seconds / day',
                unit: 'sec',
                tip: 'cpu_seconds',
                tgtBefore: avgAll(tB),
                tgtAfter: avgAll(tA),
                ctrlBefore: avgAll(cB),
                ctrlAfter: avgAll(cA),
                netBefore: avgAll(nB),
                netAfter: avgAll(nA)
            },
            // Time-per-execution: sum(CPU) / sum(exec) is window-length-independent by
            // construction (ratio of totals = weighted average per-exec cost). More honest
            // than mean-of-daily-ratios because heavy-traffic days get appropriate weight.
            perExec: {
                label: 'Time per Execution',
                unit: 'sec/req',
                tip: 'cpu_exec_ratio',
                tgtBefore: sum(eB) > 0 ? sum(tB) / sum(eB) : null,
                tgtAfter: sum(eA) > 0 ? sum(tA) / sum(eA) : null,
                ctrlBefore: sum(cExecB) > 0 ? sum(cB) / sum(cExecB) : null,
                ctrlAfter: sum(cExecA) > 0 ? sum(cA) / sum(cExecA) : null,
                netBefore: sum(nExecB) > 0 ? sum(nB) / sum(nExecB) : null,
                netAfter: sum(nExecA) > 0 ? sum(nA) / sum(nExecA) : null
            }
        };
        // Derive % changes consistently for every lens.
        for (const k of ['exec', 'cpu', 'perExec']) {
            const L = lenses[k];
            L.tgtCh = safePctCh(L.tgtBefore, L.tgtAfter);
            L.ctrlCh = safePctCh(L.ctrlBefore, L.ctrlAfter);
            L.netCh = safePctCh(L.netBefore, L.netAfter);
        }
        // DiD net effect: target % change minus BASELINE % change (baseline = selected group).
        // Negative = the fix beat the comparison group. Network kept separately as context.
        const netEffectPct = (targetPctCh !== null && baselinePctCh !== null) ? targetPctCh - baselinePctCh : null;
        // Net Effect vs the whole network — retained as a context reading alongside the headline.
        const netEffectPctVsNetwork = (targetPctCh !== null && networkPctCh !== null) ? targetPctCh - networkPctCh : null;
        // Counterfactual: if the target had drifted with the BASELINE group, where would after-CPU sit?
        const expectedAfter = (baselinePctCh !== null && tAvgB > 0) ? tAvgB * (1 + baselinePctCh / 100) : null;
        // Positive = saved CPU/day vs the counterfactual; negative = the target did worse than peers.
        const savedCpuPerDay = expectedAfter !== null ? expectedAfter - tAvgA : null;
        // ── Per-site change, activity classification, exec-growth efficiency ───────
        // For each site we record bAvg/aAvg/pctCh AND classify the activity transition so
        // tiny sites going 1→100 don't dominate a "+9900%" ranking, and we can spot sites
        // that recently went live or died. We also compute cpu-vs-exec growth ratio: if a
        // site's CPU grew faster than its exec count, each request is getting more expensive.
        const perSiteRaw = data.siteStats.map(s => {
            const bV = bDates.map(d => data.sv(s.domain, d));
            const aV = aDates.map(d => data.sv(s.domain, d));
            const bAvg = avgAll(bV)
              , aAvg = avgAll(aV);
            const exB = bDates.map(d => data.ev(s.domain, d));
            const exA = aDates.map(d => data.ev(s.domain, d));
            const exBAvg = avgAll(exB)
              , exAAvg = avgAll(exA);
            const cpuCh = pctCh(bAvg, aAvg);
            const exCh = pctCh(exBAvg, exAAvg);
            let activityClass = 'STABLE';
            if (bAvg === 0 && aAvg === 0)
                activityClass = 'INACTIVE';
            else if (bAvg === 0 && aAvg > 0)
                activityClass = 'NEW';
            else if (bAvg > 0 && aAvg === 0)
                activityClass = 'DIED';
            else if (cpuCh !== null && cpuCh < -25)
                activityClass = 'SHRANK';
            else if (cpuCh !== null && cpuCh > 25)
                activityClass = 'GREW';
            // CPU-per-exec change: did each request get cheaper or heavier?
            const costB = exBAvg > 0 ? bAvg / exBAvg : null;
            const costA = exAAvg > 0 ? aAvg / exAAvg : null;
            const costCh = costB && costA ? pctCh(costB, costA) : null;
            return {
                domain: s.domain,
                bAvg,
                aAvg,
                absCh: aAvg - bAvg,
                pctCh: cpuCh,
                exBAvg,
                exAAvg,
                exCh,
                costB,
                costA,
                costCh,
                activityClass,
                isTarget: s.domain === target
            };
        }
        );
        // For ranking we drop INACTIVE/NEW/DIED sites — their %-change is either meaningless
        // (no baseline) or undefined. Also drop user-excluded sites. The target site is always
        // kept regardless of exclusion (it's the subject of the comparison).
        const perSite = perSiteRaw.filter(r => r.pctCh !== null && r.bAvg > 0 && !['NEW', 'DIED', 'INACTIVE'].includes(r.activityClass) && (r.isTarget || !isExcluded(r.domain)));
        // Ascending: most-improved (largest drop) first; least-improved (largest rise) last.
        const sortedByChange = [...perSite].sort( (a, b) => a.pctCh - b.pctCh);
        const targetRank = sortedByChange.findIndex(r => r.isTarget) + 1;
        // Percentile of *improvement*: rank 1 of N → 100% (best), rank N → 0%.
        const targetPercentile = perSite.length > 1 && targetRank > 0 ? ((perSite.length - targetRank) / (perSite.length - 1)) * 100 : null;
        // Statistical significance on target CPU before vs after (Welch's t-test, two-tailed)
        const stat = welchT(tB, tA);
        // ── Weekday-paired analysis — removes day-of-week seasonality ──────────────
        // Build pairs where a before-day's weekday matches an after-day's weekday. Compare
        // ONLY paired days. If 5 Mondays/Tues/Weds/Thurs/Fris appear in both windows, this is
        // far more robust than a raw avg(before) vs avg(after) that could be Mon-Fri vs Sat-Sun.
        const bByDow = new Map();
        bDates.forEach(d => {
            const w = weekdayOf(d);
            if (!bByDow.has(w))
                bByDow.set(w, []);
            bByDow.get(w).push(d);
        }
        );
        const tBPaired = [], tAPaired = [], nBPaired = [], nAPaired = [], cBPaired = [], cAPaired = [], dowsCovered = new Set();
        aDates.forEach(ad => {
            const w = weekdayOf(ad);
            const candidates = bByDow.get(w);
            if (candidates && candidates.length) {
                // Use the most recent before-day with this weekday (pop so each pairs once).
                const bd = candidates.shift();
                tBPaired.push(data.sv(target, bd));
                tAPaired.push(data.sv(target, ad));
                nBPaired.push(networkDoms.reduce( (s, dd) => s + data.sv(dd, bd), 0));
                nAPaired.push(networkDoms.reduce( (s, dd) => s + data.sv(dd, ad), 0));
                cBPaired.push(ctrlDoms.reduce( (s, dd) => s + data.sv(dd, bd), 0));
                cAPaired.push(ctrlDoms.reduce( (s, dd) => s + data.sv(dd, ad), 0));
                dowsCovered.add(w);
            }
        }
        );
        const tBPAvg = avgAll(tBPaired)
          , tAPAvg = avgAll(tAPaired);
        const nBPAvg = avgAll(nBPaired)
          , nAPAvg = avgAll(nAPaired);
        const cBPAvg = avgAll(cBPaired)
          , cAPAvg = avgAll(cAPaired);
        const targetPctChPaired = pctCh(tBPAvg, tAPAvg);
        const networkPctChPaired = pctCh(nBPAvg, nAPAvg);
        // Baseline (selected group) paired change drives the paired net effect; network kept for context.
        const baselinePctChPaired = (pctCh(cBPAvg, cAPAvg) !== null) ? pctCh(cBPAvg, cAPAvg) : networkPctChPaired;
        const netEffectPctPaired = (targetPctChPaired !== null && baselinePctChPaired !== null) ? targetPctChPaired - baselinePctChPaired : null;
        // ── Difference-in-Differences on weekday-matched pairs (the isolated-fix test) ──
        // Per matched pair, take the LOG change of the target minus the LOG change of the baseline
        // group across the SAME two dates:   did_i = (ln tA_i − ln tB_i) − (ln cA_i − ln cB_i)
        // A one-sample t-test of did_i vs 0 asks whether the target moved differently from its peers
        // beyond chance. Doing it per-pair (not target-vs-a-fixed-growth-constant) is what propagates
        // the CONTROL group's own variance into the standard error — the old version treated the
        // baseline growth factor as known-exact and so reported falsely tight significance.
        const cPairB = (cBPAvg > 0) ? cBPaired : ((nBPAvg > 0) ? nBPaired : null);
        const cPairA = (cBPAvg > 0) ? cAPaired : ((nBPAvg > 0) ? nAPaired : null);
        const didPairs = [];
        if (cPairB && cPairA)
            for (let i = 0; i < tBPaired.length; i++) {
                const tb = tBPaired[i], ta = tAPaired[i], cb = cPairB[i], ca = cPairA[i];
                if (tb > 0 && ta > 0 && cb > 0 && ca > 0)
                    didPairs.push(Math.log(ta / tb) - Math.log(ca / cb));
            }
        // statResid keeps its name for downstream callers; it is now the paired DiD one-sample test.
        const statResid = oneSampleT(didPairs, 0);
        // Isolated effect as a % (exp of the mean log-DiD). Negative = target improved vs its peers.
        const didEffectPct = statResid ? (Math.exp(statResid.mean) - 1) * 100 : null;
        // Lag-1 autocorrelation of the target window — if high, even paired days aren't fully
        // independent, so the credibility score tempers the significance bonus rather than over-claim.
        const targetAcf1 = lag1Acf([...tB, ...tA]);
        // ── Plan-change straddle: does the window cross a plan upgrade/downgrade? ──
        const planStraddles = (data.planChanges || []).filter(c => c.date >= bStart && c.date <= aEnd);
        // ── Credibility score (0–100) ──────────────────────────────────────────────
        // Combines: window length, weekday-pairing coverage, plan-change straddle, t-test p, sample size.
        const credibility = ( () => {
            let score = 0;
            const reasons = [];
            // Days-after weight: 0d=0, 3d=15, 5d=22, 7d+=30
            const af = aDates.length;
            score += af >= 7 ? 30 : af >= 5 ? 22 : af >= 3 ? 15 : af >= 1 ? 6 : 0;
            if (af < 5)
                reasons.push(`only ${af} complete after-day${af === 1 ? '' : 's'} (5–7+ recommended)`);
            // Days-before weight: same scale, 20pt max
            const bf = bDates.length;
            score += bf >= 7 ? 20 : bf >= 5 ? 14 : bf >= 3 ? 8 : 0;
            if (bf < 5)
                reasons.push(`only ${bf} complete before-day${bf === 1 ? '' : 's'}`);
            // Weekday coverage: how many distinct weekdays are paired? 7=20pt, 5=15, 3=8.
            const dc = dowsCovered.size;
            score += dc >= 7 ? 20 : dc >= 5 ? 15 : dc >= 3 ? 8 : 0;
            if (dc < 5)
                reasons.push(`only ${dc} distinct weekday${dc === 1 ? '' : 's'} matched between before/after`);
            // Plan-change straddle: the DiD and Welch's tests run on CPU seconds (absolute),
            // so a plan upgrade does NOT contaminate them. Worth noting for context, not penalising.
            score += 10;
            if (planStraddles.length) {
                reasons.push(`plan changed inside the window (${planStraddles.map(p => `${p.kind} ${p.fromVal}→${p.toVal} on ${p.date}`).join('; ')}) — CPU-seconds DiD is unaffected; only the % readings are normalised`);
            }
            // Significance bonus comes ONLY from the paired difference-in-differences test, and only
            // with enough matched pairs (>=5). If the target series is autocorrelated the paired days
            // share information, so we halve the bonus and say so rather than report a falsely tight p.
            const enoughPairs = (tBPaired?.length || 0) >= 5;
            if (statResid?.p !== undefined && enoughPairs) {
                const acfHi = isFinite(targetAcf1) && targetAcf1 > 0.4;
                const full = statResid.p < 0.05 ? 20 : statResid.p < 0.1 ? 10 : 0;
                score += acfHi ? Math.round(full / 2) : full;
                if (full === 0)
                    reasons.push(`isolated effect not statistically significant on the weekday-paired difference-in-differences (p=${statResid.p.toFixed(3)})`);
                else if (acfHi)
                    reasons.push(`significance bonus halved — the target's day-to-day series is autocorrelated (lag-1 ρ=${targetAcf1.toFixed(2)}), so paired days aren't fully independent and the p-value is optimistic`);
            } else if (!enoughPairs) {
                reasons.push(`fewer than 5 weekday-matched pairs — too few to test the isolated effect for significance`);
            }
            // Baseline-size penalty: the verdict is graded against the SELECTED comparison group.
            // The whole network is the largest, least cherry-pickable sample, so it's never
            // penalised; a curated subset trades robustness for like-for-like and is docked by
            // how small (and therefore noisy / cherry-pickable) it is.
            if (!ctrlIsNetwork) {
                const bn = ctrlDoms.length;
                if (bn < 2) {
                    score -= 18;
                    reasons.push(`comparison baseline is a single site — extremely cherry-pickable; treat the isolated-effect read as indicative only`);
                } else if (bn < 3) {
                    score -= 14;
                    reasons.push(`only ${bn} sites in the comparison baseline — a small peer set is easy to cherry-pick and gives a noisy counterfactual`);
                } else if (bn < 5) {
                    score -= 7;
                    reasons.push(`small comparison baseline (${bn} sites) — fine for like-for-like, but a wider group is more robust`);
                }
            }
            score = Math.max(0, Math.min(100, score));
            const verdict = score >= 75 ? 'High' : score >= 50 ? 'Moderate' : score >= 25 ? 'Low' : 'Very Low';
            return {
                score,
                verdict,
                reasons
            };
        }
        )();
        const metrics = [{
            key: 'cpu_avg',
            tip: 'cpu_seconds',
            title: 'Avg Daily CPU',
            before: avgAll(tB),
            after: avgAll(tA),
            fmt: fmtN,
            unit: 'CPU sec',
            desc: 'Average daily CPU seconds'
        }, {
            key: 'cpu_tot',
            tip: 'cpu_seconds',
            title: 'Total CPU',
            before: tB.reduce( (s, v) => s + v, 0),
            after: tA.reduce( (s, v) => s + v, 0),
            fmt: fmtN,
            unit: 'CPU sec',
            desc: 'Sum over window'
        }, {
            key: 'cpu_pk',
            tip: 'peak_day',
            title: 'Peak Day',
            before: Math.max(0, ...tB, 0),
            after: Math.max(0, ...tA, 0),
            fmt: fmtN,
            unit: 'CPU sec',
            desc: 'Highest single day'
        }, {
            key: 'ex_avg',
            tip: 'program_executions',
            title: 'Avg Daily Exec',
            before: avgAll(eB),
            after: avgAll(eA),
            fmt: fmtN,
            unit: 'exec',
            desc: 'Avg daily executions',
            hide: !data.hasExec
        }, {
            key: 'cpu_ex',
            tip: 'cpu_exec_ratio',
            title: 'CPU / Execution',
            before: cpuExB,
            after: cpuExA,
            fmt: v => fmtD(v, 1),
            unit: 'sec/exec',
            desc: 'Cost per PHP invocation',
            hide: !data.hasExec || cpuExB === null
        }, {
            key: 'ctrl',
            tip: 'control_group',
            title: 'Control Avg Daily',
            before: avgAll(cB),
            after: avgAll(cA),
            fmt: fmtN,
            unit: 'CPU sec',
            desc: 'Curated peer sites',
            neutral: true
        }, {
            key: 'network',
            tip: 'network_change',
            title: 'Network Avg Daily',
            before: nAvgB,
            after: nAvgA,
            fmt: fmtN,
            unit: 'CPU sec',
            desc: `All ${networkDoms.length} other active sites`,
            neutral: true
        }, {
            key: 'acct',
            tip: 'account_total',
            title: 'Account Avg Daily',
            before: avgAll(aB),
            after: avgAll(aA),
            fmt: fmtN,
            unit: 'CPU sec',
            desc: 'Server-wide daily CPU',
            neutral: true
        }, {
            key: 'share',
            tip: 'target_share',
            title: 'Target Share',
            before: avgAll(aB) ? avgAll(tB) / avgAll(aB) * 100 : 0,
            after: avgAll(aA) ? avgAll(tA) / avgAll(aA) * 100 : 0,
            fmt: fmtD,
            unit: '%',
            desc: '% of total server CPU'
        }, {
            key: 'ratio',
            tip: 'target_ratio',
            title: 'Target / Control',
            before: avgAll(cB) ? avgAll(tB) / avgAll(cB) * 100 : 0,
            after: avgAll(cA) ? avgAll(tA) / avgAll(cA) * 100 : 0,
            fmt: fmtD,
            unit: '%',
            desc: 'Target vs control isolation metric'
        }, {
            key: 'core',
            tip: 'core_pct',
            title: 'Server Cores Avg',
            before: avgAll(kB),
            after: avgAll(kA),
            fmt: v => fmtD(v, 2),
            unit: ` / ${data.currentCoreLimit} cores`,
            desc: 'Avg cores in use (plan-immune)',
            neutral: true
        }, {
            key: 'mem_avg',
            tip: 'mem_combined',
            title: 'Avg Daily Mem',
            before: avgAll(mB),
            after: avgAll(mA),
            fmt: v => fmtD(v, 2),
            unit: ` GB / ${data.currentMemLimitGb ?? '?'}`,
            desc: 'Avg daily memory used (GB)',
            hide: !data.hasMem
        }, {
            key: 'mem_peak',
            tip: 'peak_day',
            title: 'Window Peak Mem',
            before: Math.max(0, ...mB, 0),
            after: Math.max(0, ...mA, 0),
            fmt: v => fmtD(v, 2),
            unit: ' GB',
            desc: 'Highest single-day GB',
            hide: !data.hasMem
        }, ].filter(m => !m.hide);
        // Excluded sites that would otherwise have been in the network — surfaced
        // in the Before/After header so users can verify their exclusions are honoured.
        const excludedFromNet = data.siteStats.filter(s => s.domain !== target && s.total > 0 && s.isExcluded).map(s => s.domain);
        return {
            metrics,
            lenses,
            ctrlDoms,
            networkDoms,
            excludedFromNet,
            bDates,
            aDates,
            tB,
            tA,
            cB,
            cA,
            nB,
            nA,
            aB,
            aA,
            kB,
            kA,
            eB,
            eA,
            mB,
            mA,
            stat,
            bStart,
            bEnd,
            aStart,
            aEnd,
            tAvgB,
            tAvgA,
            nAvgB,
            nAvgA,
            targetPctCh,
            networkPctCh,
            netEffectPct,
            netEffectPctVsNetwork,
            controlPctCh,
            baselinePctCh,
            ctrlIsNetwork,
            cAvgB,
            cAvgA,
            expectedAfter,
            savedCpuPerDay,
            perSite,
            perSiteRaw,
            sortedByChange,
            targetRank,
            targetPercentile,
            tBPaired,
            tAPaired,
            nBPaired,
            nAPaired,
            cBPaired,
            cAPaired,
            tBPAvg,
            tAPAvg,
            nBPAvg,
            nAPAvg,
            cBPAvg,
            cAPAvg,
            targetPctChPaired,
            networkPctChPaired,
            baselinePctChPaired,
            netEffectPctPaired,
            statResid,
            didEffectPct,
            targetAcf1,
            dowsCovered: [...dowsCovered].sort(),
            planStraddles,
            credibility
        };
    }
    ;

    // Per-day series for the chosen focus metric, so Welch's t-test runs on the RIGHT
    // numbers (cost-per-request, executions, memory, cores) instead of always on CPU.
    // Returns parallel before/after arrays, or null when the metric is unavailable.
    const focusSeries = (cmp, focus) => {
        if (focus === 'cpu')
            return { b: cmp.tB, a: cmp.tA };
        if (focus === 'execs')
            return { b: cmp.eB, a: cmp.eA };
        if (focus === 'memory')
            return { b: cmp.mB, a: cmp.mA };
        if (focus === 'cores')
            return { b: cmp.kB, a: cmp.kA };
        if (focus === 'cost') {
            const b = [], a = [];
            cmp.tB.forEach( (v, i) => { if (cmp.eB[i] > 0) b.push(v / cmp.eB[i]); } );
            cmp.tA.forEach( (v, i) => { if (cmp.eA[i] > 0) a.push(v / cmp.eA[i]); } );
            return { b, a };
        }
        return null;
    }
    ;

    // Lay-person interpretation lines for a specific Fix Focus. Critically, this speaks ONLY
    // to the chosen metric so a "cost per execution" report never contradicts itself with a
    // CPU-time verdict like "No isolated fix effect". Order is deliberate:
    //   1. what actually happened to the metric on the target (the headline the fix owns),
    //   2. whether that change is isolated to this site vs. the network (DiD on the SAME metric),
    //   3. statistical significance on that metric's daily series,
    //   4. rank among comparable peers on that metric.
    const focusNarrative = (cmp, focus, target, data) => {
        const out = [];
        const site = target.split('.')[0];
        // Isolation is judged against the SELECTED comparison group (baseline). When that group
        // is the whole network the two coincide and we keep the "network" wording (preserves the
        // regression anchor); otherwise the prose names the selected peers.
        const baseIsNet = !!cmp.ctrlIsNetwork;
        const baseName = baseIsNet ? 'the network' : 'your selected peers';
        const refCh = L => baseIsNet ? L.netCh : L.ctrlCh;
        const sigLine = (st, label) => {
            if (!st)
                return null;
            const p = st.p;
            const sig = p < 0.05 ? '✅ statistically significant' : p < 0.1 ? '⚠️ marginally significant' : '🔴 not statistically significant';
            return `${sig} day-to-day (Welch's t-test on daily ${label}, p=${p < 0.001 ? '<0.001' : p.toFixed(3)}${st.df ? `, df=${st.df.toFixed(1)}` : ''}).`;
        }
        ;
        // ── Combination: one concise verdict line per metric ──
        if (focus === 'combo') {
            const line = (label, lens, fmtv, unit) => {
                if (!lens || lens.tgtCh === null)
                    return null;
                const rc = refCh(lens);
                const d = (lens.tgtCh !== null && rc !== null) ? lens.tgtCh - rc : null;
                const ico = d === null ? '→' : d <= -10 ? '✅' : d >= 10 ? '🔴' : Math.abs(d) > 3 ? '⚠️' : '→';
                const iso = d === null ? 'no peer comparison available' : d <= -10 ? `isolated to ${site} — beat ${baseName} by ${Math.abs(d).toFixed(0)} pp` : d < -5 ? `mostly isolated (${d.toFixed(0)} pp vs ${baseName})` : Math.abs(d) <= 5 ? `but ${baseName} moved similarly (${signStr(rc)}), so not clearly isolated` : `worse than ${baseName} by ${d.toFixed(0)} pp`;
                return `${ico} <strong>${label}:</strong> ${signStr(lens.tgtCh)} on ${site} (${fmtv(lens.tgtBefore)} → ${fmtv(lens.tgtAfter)} ${unit}) — ${iso}.`;
            }
            ;
            if (data.hasExec) {
                const l1 = line('Cost per request', cmp.lenses.perExec, v => fmtD(v, 3), 'sec/req');
                if (l1) out.push(l1);
                const l2 = line('Request volume', cmp.lenses.exec, fmtN, 'req/day');
                if (l2) out.push(l2);
            }
            const l3 = line('CPU time', cmp.lenses.cpu, fmtN, 'CPU sec/day');
            if (l3) out.push(l3);
            if (data.hasMem) {
                const mb = avgAll(cmp.mB), ma = avgAll(cmp.mA), mc = pctCh(mb, ma);
                if (mc !== null) out.push(`${mc <= -10 ? '✅' : mc >= 5 ? '🔴' : '→'} <strong>Memory (server-wide):</strong> ${signStr(mc)} (${fmtD(mb, 2)} → ${fmtD(ma, 2)} GB). Per-site memory isn't reported by SiteGround.`);
            }
            const kb = avgAll(cmp.kB), ka = avgAll(cmp.kA), kc = pctCh(kb, ka);
            if (kc !== null) out.push(`${kc <= -10 ? '✅' : kc >= 5 ? '🔴' : '→'} <strong>Cores in use (server-wide):</strong> ${signStr(kc)} (${fmtD(kb, 2)} → ${fmtD(ka, 2)} of ${data.currentCoreLimit}).`);
            return out;
        }
        // ── Server-wide metrics: memory + cores (SG reports no per-site figure) ──
        if (focus === 'memory' || focus === 'cores') {
            const isMem = focus === 'memory';
            if (isMem && !data.hasMem) {
                out.push(`⚠️ Memory data isn't available for this account, so a memory-specific verdict can't be produced.`);
                return out;
            }
            const bAvg = avgAll(isMem ? cmp.mB : cmp.kB), aAvg = avgAll(isMem ? cmp.mA : cmp.kA);
            const ch = pctCh(bAvg, aAvg);
            const unit = isMem ? 'GB' : 'cores';
            const noun = isMem ? 'peak memory in use' : 'cores in use';
            const word = isMem ? 'memory' : 'cores';
            const fmtv = v => fmtD(v, 2);
            if (ch === null)
                out.push(`→ Not enough ${noun} data over the window to judge.`);
            else if (ch <= -10)
                out.push(`✅ <strong>Server-wide ${noun} fell ${Math.abs(ch).toFixed(0)}%</strong> (${fmtv(bAvg)} → ${fmtv(aAvg)} ${unit}/day average) — a real reduction in what the server was carrying.`);
            else if (ch < -3)
                out.push(`⚠️ <strong>Server-wide ${noun} eased ${Math.abs(ch).toFixed(0)}%</strong> (${fmtv(bAvg)} → ${fmtv(aAvg)} ${unit}/day) — a modest improvement.`);
            else if (Math.abs(ch) <= 3)
                out.push(`→ <strong>Server-wide ${noun} barely moved (${signStr(ch)}).</strong> At the whole-server level this fix didn't change how much was in use — but per-site ${word} isn't reported by SiteGround, so a real site-level saving can be hidden inside a flat server total. Use the CPU-share line below as a proxy.`);
            else
                out.push(`🔴 <strong>Server-wide ${noun} rose ${ch.toFixed(0)}%</strong> over the window — the opposite of the intended effect.`);
            const shareB = avgAll(cmp.aB) ? cmp.tAvgB / avgAll(cmp.aB) * 100 : null;
            const shareA = avgAll(cmp.aA) ? cmp.tAvgA / avgAll(cmp.aA) * 100 : null;
            const shareCh = pctCh(shareB, shareA);
            if (shareCh !== null) {
                if (ch !== null && ch <= -5 && shareCh < -5)
                    out.push(`✅ Attribution: <strong>${site}'s share of server CPU dropped from ${fmtD(shareB, 1)}% to ${fmtD(shareA, 1)}%</strong> over the same window. The ${word} drop and ${site}'s shrinking footprint move together — a strong sign your fix is what freed the ${word}.`);
                else if (ch !== null && ch <= -5)
                    out.push(`⚠️ Attribution: ${noun} fell, but ${site}'s CPU share moved ${signStr(shareCh)} — the relief may have come partly from another site. Per-site ${word} isn't reported by SiteGround, so cross-check the All-Sites Ranking below to see which site actually got lighter.`);
                else
                    out.push(`ℹ️ ${site}'s share of server CPU went ${signStr(shareCh)} (${fmtD(shareB, 1)}% → ${fmtD(shareA, 1)}%). Per-site ${word} isn't reported by SiteGround, so attribution leans on this CPU-share proxy.`);
            }
            const fs = focusSeries(cmp, focus);
            const st = fs && fs.b.length >= 2 && fs.a.length >= 2 ? welchT(fs.b, fs.a) : null;
            const sl = sigLine(st, noun);
            if (sl) out.push(sl);
            return out;
        }
        // ── Per-site metrics: cost per execution, execution volume ──
        if (!data.hasExec) {
            out.push(`⚠️ Execution data isn't available for this account, so a ${esc(FOCUS_LABELS[focus] || focus)} verdict can't be produced. Switch Fix Focus to <em>Reduce CPU time</em> or <em>Show everything</em>.`);
            return out;
        }
        const lens = focus === 'cost' ? cmp.lenses.perExec : cmp.lenses.exec;
        const tgtCh = lens.tgtCh, netCh = refCh(lens);
        const did = (tgtCh !== null && netCh !== null) ? tgtCh - netCh : null;
        const noun = focus === 'cost' ? 'the CPU cost of each request' : 'request volume';
        const fmtv = focus === 'cost' ? (v => fmtD(v, 3) + ' sec/req') : (v => fmtN(v) + ' req/day');
        // Wording that keeps the baseIsNet case byte-identical to the original (regression anchor)
        // while naming the selected peers when a curated group is the baseline.
        const scope = baseIsNet ? 'the rest of the server' : 'your selected peers';
        const trend = baseIsNet ? 'a server-wide trend' : 'shared with the comparison group';
        const trackScope = baseIsNet ? 'the whole server' : 'your selected peers';
        if (tgtCh === null)
            out.push(`→ Not enough data to measure ${noun} on ${site}.`);
        else {
            const dir = tgtCh < 0 ? 'fell' : 'rose';
            const goodDir = tgtCh < 0;
            const ico = goodDir && tgtCh <= -10 ? '✅' : goodDir ? '⚠️' : '🔴';
            out.push(`${ico} <strong>On ${site}, ${noun} ${dir} ${Math.abs(tgtCh).toFixed(0)}%</strong> (${fmtv(lens.tgtBefore)} → ${fmtv(lens.tgtAfter)}).${goodDir ? '' : ' That\'s the opposite of the intended direction — worth investigating.'}`);
        }
        if (did !== null) {
            if (did <= -15)
                out.push(`✅ <strong>This is isolated to ${site}.</strong> Across ${scope}, ${noun} ${netCh < 0 ? 'fell' : 'rose'} ${Math.abs(netCh).toFixed(0)}%, so ${site} beat ${baseName} by ${Math.abs(did).toFixed(0)} points — the improvement is something your fix did here, not ${trend}.`);
            else if (did < -5)
                out.push(`⚠️ <strong>Mostly isolated.</strong> ${baseIsNet ? "Peers'" : "Your selected peers'"} ${noun} moved ${signStr(netCh)} as well, so roughly ${Math.abs(did).toFixed(0)} points of the change is credited to your fix and the rest is ambient drift. Still a real, mostly-attributable gain.`);
            else if (Math.abs(did) <= 5)
                out.push(`→ <strong>The change tracks ${trackScope}.</strong> ${site} moved ${signStr(tgtCh)} and ${baseName} moved ${signStr(netCh)} — almost the same.${tgtCh < 0 ? ` ${site}'s ${noun} genuinely dropped, but so did ${baseIsNet ? 'everyone\'s' : 'your peers\''}, so we can't prove the fix (rather than a quiet period) is what caused it.` : ''} To isolate it, narrow the window to right around the deploy or pick a tighter peer group.`);
            else
                out.push(`🔴 <strong>${site} underperformed ${baseName}</strong> on ${noun} by ${did.toFixed(0)} points — ${baseIsNet ? 'the rest of the server' : 'your selected peers'} improved more than ${site} did.`);
        }
        const fs = focusSeries(cmp, focus);
        const st = fs && fs.b.length >= 2 && fs.a.length >= 2 ? welchT(fs.b, fs.a) : null;
        const sl = sigLine(st, focus === 'cost' ? 'cost per request' : 'executions');
        if (sl) out.push(sl);
        const getCh = focus === 'cost' ? (r => r.costCh) : (r => r.exCh);
        const ranked = rankByMetric(cmp.perSiteRaw, getCh, target);
        const idx = ranked.findIndex(r => r.isTarget);
        if (idx >= 0 && ranked.length > 1) {
            const r = idx + 1, n = ranked.length;
            const pctl = (n - r) / (n - 1) * 100;
            const ico = pctl >= 70 ? '✅' : pctl >= 40 ? '⚠️' : '🔴';
            out.push(`${ico} Among ${n} comparable sites, <strong>${site} ranks #${r}</strong> for ${focus === 'cost' ? 'cost-per-request' : 'volume'} improvement (better than ${pctl.toFixed(0)}% of peers).`);
        }
        return out;
    }
    ;

    const interpret = (cmp, target, focus = 'auto', data = S.data) => {
        const parts = [];
        const g = k => cmp.metrics.find(m => m.key === k);
        const tM = g('cpu_avg')
          , cM = g('ctrl')
          , sM = g('share')
          , eM = g('ex_avg')
          , ceM = g('cpu_ex');
        const site = target.split('.')[0];
        // The DiD verdict is graded against the SELECTED comparison group (baseline). When that
        // group is the whole network the wording stays "network" (regression anchor preserved);
        // otherwise the prose names the selected peers. bn/bnShort/restPhrase keep the baseIsNet
        // branch byte-identical to the original strings.
        const baseIsNet = !!cmp.ctrlIsNetwork;
        const bn = baseIsNet ? 'the network' : 'your selected peers';
        const bnShort = baseIsNet ? 'network' : 'selected peers';
        const restPhrase = baseIsNet ? 'the rest of the account' : 'your selected peers';
        // Plan-change context: every metric is in absolute units (CPU sec, cores in use, GB),
        // so the comparison is plan-immune by construction. This is purely informational.
        if (cmp.planStraddles && cmp.planStraddles.length) {
            const list = cmp.planStraddles.map(p => `<strong>${p.kind === 'core' ? 'core' : 'memory'} ${p.fromVal}→${p.toVal}</strong> on ${p.date}`).join('; ');
            parts.push(`ℹ️ Plan upgraded inside this window (${list}). Every metric on this dashboard is in <strong>absolute units</strong> (CPU sec, cores in use, GB) — plan-immune by construction, so the comparison is fine. The purple marker is a reference point.`);
        }
        // Credibility headline — gives the reader a single number for "how much should I trust this?"
        if (cmp.credibility) {
            const c = cmp.credibility;
            const ico = c.score >= 75 ? '✅' : c.score >= 50 ? '⚠️' : '🔴';
            const reasonsBit = c.reasons.length ? ` <em>Issues:</em> ${c.reasons.join('; ')}.` : '';
            parts.push(`${ico} <strong>Credibility: ${c.score}/100 (${c.verdict}).</strong>${reasonsBit}`);
        }
        // FOCUS MODE: when the user has chosen a specific metric to demonstrate (cost / execs /
        // memory / cores / combo), the entire interpretation speaks ONLY to that metric. Running
        // the CPU-time DiD here would contradict a cost report ("No isolated fix effect" refers to
        // CPU, not cost) — so we return the focus narrative and stop. 'cpu' and 'auto' fall through
        // to the original full CPU-centric interpretation below.
        if (focus !== 'auto' && focus !== 'cpu') {
            focusNarrative(cmp, focus, target, data).forEach(l => parts.push(l));
            if (cmp.aDates.length < 3)
                parts.push(`⚠️ Only <strong>${cmp.aDates.length} complete after-day${cmp.aDates.length === 1 ? '' : 's'}</strong>. 5–7 days are recommended before presenting results.`);
            return parts;
        }
        // Three-lens narrative: did traffic drop, did total work drop, did per-request cost drop?
        // The combination is the verdict. Per-exec moving differently from peers is the cleanest
        // signal of an actual optimisation (vs. just less traffic happening to everyone).
        if (cmp.lenses) {
            const L = cmp.lenses;
            const execCh = L.exec.tgtCh, cpuCh = L.cpu.tgtCh, perExCh = L.perExec.tgtCh;
            const netPerEx = L.perExec.netCh;
            // Classify the fix pattern from the three deltas
            const movedDown = v => v !== null && v < -5;
            const movedUp = v => v !== null && v > 5;
            const flat = v => v !== null && Math.abs(v) <= 5;
            let pattern, ico;
            if (movedDown(execCh) && movedDown(perExCh)) {
                pattern = `<strong>Traffic ${signStr(execCh)} AND per-request cost ${signStr(perExCh)}</strong> — best-case: fewer requests <em>and</em> each one cheaper. Pure optimisation win on top of reduced load.`;
                ico = '✅';
            } else if (flat(execCh) && movedDown(perExCh)) {
                pattern = `<strong>Traffic flat, per-request cost ${signStr(perExCh)}</strong> — the holy-grail pattern: same volume, each hit now cheaper. This is what a code optimisation looks like.`;
                ico = '✅';
            } else if (movedDown(execCh) && flat(perExCh)) {
                pattern = `<strong>Traffic ${signStr(execCh)}, per-request cost unchanged</strong> — you blocked requests rather than making them cheaper. Same code, less of it running.`;
                ico = '⚠️';
            } else if (movedDown(execCh) && movedUp(perExCh)) {
                pattern = `<strong>Traffic ${signStr(execCh)} but per-request cost ${signStr(perExCh)}</strong> — cheap requests got blocked while expensive ones still run. Investigate which traffic was filtered.`;
                ico = '🔴';
            } else if (movedUp(execCh) && movedDown(perExCh)) {
                pattern = `<strong>Traffic ${signStr(execCh)}, per-request cost ${signStr(perExCh)}</strong> — server got faster <em>despite</em> more load. Strongest optimisation signal possible.`;
                ico = '✅';
            } else if (movedUp(execCh) && movedUp(perExCh)) {
                pattern = `<strong>Traffic and cost both rising</strong> (${signStr(execCh)} exec, ${signStr(perExCh)} per-request). Workload growing on every axis — capacity-planning territory.`;
                ico = '🔴';
            } else {
                pattern = `Traffic ${execCh === null ? '—' : signStr(execCh)}, CPU ${cpuCh === null ? '—' : signStr(cpuCh)}, per-request cost ${perExCh === null ? '—' : signStr(perExCh)}. No dominant fix pattern.`;
                ico = '→';
            }
            // Per-exec vs baseline — is the target's per-request cost moving differently from the
            // selected comparison group? (Whole network when that's the selected group.)
            let peerBit = '';
            const netPerExB = baseIsNet ? netPerEx : cmp.lenses.perExec.ctrlCh;
            if (perExCh !== null && netPerExB !== null) {
                const did = perExCh - netPerExB;
                if (did <= -10) peerBit = ` <strong>Target's per-request cost beat ${bnShort} by ${Math.abs(did).toFixed(0)} pp</strong> — site-specific optimisation, not account-wide drift.`;
                else if (did < -5) peerBit = ` Target's per-request cost ${signStr(perExCh)} vs ${bnShort} ${signStr(netPerExB)} — modest peer-relative improvement.`;
                else if (Math.abs(did) <= 5) peerBit = ` Target's per-request cost moved with ${bn} (target ${signStr(perExCh)} vs ${bnShort} ${signStr(netPerExB)}) — likely shared infrastructure or ambient drift, not a site-specific fix.`;
                else if (did > 5) peerBit = ` <strong>Target's per-request cost rose ${did.toFixed(0)} pp more than ${bnShort}</strong> — site-specific regression.`;
            }
            parts.push(`${ico} ${pattern}${peerBit}`);
        }
        // Lead with the difference-in-differences result — it's the single most credible "did the
        // fix do anything?" answer. Graded against the selected baseline (= network when chosen).
        if (cmp.netEffectPct !== null && cmp.targetPctCh !== null && cmp.baselinePctCh !== null) {
            const ne = cmp.netEffectPct;
            const tc = cmp.targetPctCh;
            const nc = cmp.baselinePctCh;
            const saved = cmp.savedCpuPerDay;
            const expected = cmp.expectedAfter;
            const counter = (saved !== null && expected !== null) ? ` If the target had drifted with ${bn} it would now sit at ~<strong>${fmtN(expected)}</strong> CPU sec/day; it actually sits at <strong>${fmtN(cmp.tAvgA)}</strong> — a net ${saved >= 0 ? 'saving' : 'loss'} of <strong>${fmtN(Math.abs(saved))}</strong> CPU sec/day vs the counterfactual.` : '';
            if (ne <= -15)
                parts.push(`✅ <strong>Fix beat ${bn} by ${Math.abs(ne).toFixed(0)} percentage points.</strong> Target ${tc < 0 ? 'fell' : 'rose'} ${Math.abs(tc).toFixed(0)}% while ${restPhrase} ${nc < 0 ? 'fell' : 'rose'} ${Math.abs(nc).toFixed(0)}%.${counter}`);
            else if (ne < -5)
                parts.push(`⚠️ <strong>Modest isolated effect (${ne.toFixed(0)} pp net).</strong> Target ${tc < 0 ? 'fell' : 'rose'} ${Math.abs(tc).toFixed(0)}% vs ${bnShort} ${nc < 0 ? 'down' : 'up'} ${Math.abs(nc).toFixed(0)}%. Most of the apparent improvement is real, but a meaningful share could be ambient.${counter}`);
            else if (Math.abs(ne) <= 5)
                parts.push(`🔴 <strong>No isolated fix effect.</strong> Target moved with ${bn} (target ${signStr(tc)} vs ${bnShort} ${signStr(nc)}; net effect ${signStr(ne)}). ${baseIsNet ? 'Whatever happened, it happened to <em>everyone</em>' : 'The same shift hit your selected peers'} — the fix can't be credited with the change.${counter}`);
            else
                parts.push(`🔴 <strong>Target underperformed ${bn} by ${ne.toFixed(0)} pp.</strong> ${baseIsNet ? 'Network' : 'Your selected peers'} ${nc < 0 ? 'fell' : 'rose'} ${Math.abs(nc).toFixed(0)}% but target ${tc < 0 ? 'only fell' : 'rose'} ${Math.abs(tc).toFixed(0)}%. The fix may have made things worse relative to peers.${counter}`);
            // When a curated subset is the baseline, surface the whole-network cross-check so the
            // broad picture isn't lost. (Skipped when the baseline already IS the network.)
            if (!baseIsNet && cmp.netEffectPctVsNetwork !== null)
                parts.push(`ℹ️ Context — against the <strong>whole network</strong> (${cmp.networkDoms.length} sites) the net effect is <strong>${cmp.netEffectPctVsNetwork > 0 ? '+' : ''}${cmp.netEffectPctVsNetwork.toFixed(1)} pp</strong> (network ${signStr(cmp.networkPctCh)}). Your selected baseline drives the headline above; this is the broad cross-check.`);
        }
        // Weekday-paired DiD — same idea as the raw DiD above, but only counts days that
        // matched weekday-for-weekday between before and after. More honest if the windows
        // have different calendar mixes.
        if (cmp.netEffectPctPaired !== null && cmp.tBPaired.length >= 3 && cmp.netEffectPct !== null) {
            const ne = cmp.netEffectPctPaired;
            const raw = cmp.netEffectPct;
            const diff = ne - raw;
            const note = Math.abs(diff) > 5 ? ` — meaningfully different from the raw DiD (${signStr(raw)}); the calendar mix of your windows is driving part of the apparent effect.` : '';
            const ico = ne <= -15 ? '✅' : ne < -5 ? '⚠️' : '🔴';
            parts.push(`${ico} Weekday-paired net effect: <strong>${signStr(ne)} pp</strong> (target ${signStr(cmp.targetPctChPaired)} vs ${bnShort} ${signStr(cmp.baselinePctChPaired)}, ${cmp.tBPaired.length} matched day-pairs covering ${cmp.dowsCovered.length} weekdays).${note}`);
        }
        // DiD residual t-test — does the deviation from the baseline's drift differ from zero?
        if (cmp.statResid?.p !== undefined) {
            const p = cmp.statResid.p;
            const sig = p < 0.01 ? '✅ <strong>statistically significant</strong>' : p < 0.05 ? '✅ statistically significant' : p < 0.1 ? '⚠️ marginally significant' : '🔴 <strong>not statistically significant</strong>';
            parts.push(`${sig} isolated-fix test — a one-sample t-test of the weekday-paired difference-in-differences (per-pair log change of ${site} minus ${bnShort}; p=${p < 0.001 ? '<0.001' : p.toFixed(3)}, df=${cmp.statResid.df.toFixed(1)}). Unlike a raw before/after test it carries the comparison group's own variance, so it won't call a shift "significant" just because the peers happened to be quiet.`);
        }
        // Rank context — answers "is my target unusual?"
        if (cmp.targetRank > 0 && cmp.perSite.length > 1) {
            const pct = cmp.targetPercentile;
            const r = cmp.targetRank;
            const n = cmp.perSite.length;
            if (pct !== null) {
                const verdict = pct >= 80 ? `✅ <strong>${site}</strong> ranks #${r} of ${n} (top ${(100 - pct).toFixed(0)}%) by improvement` : pct >= 50 ? `⚠️ <strong>${site}</strong> ranks #${r} of ${n} (improved more than ${pct.toFixed(0)}% of sites)` : `🔴 <strong>${site}</strong> ranks #${r} of ${n} — ${(100 - pct).toFixed(0)}% of sites improved more than this`;
                parts.push(`${verdict} — see the All-Sites Ranking section below for the full distribution.`);
            }
        }
        if (tM) {
            const ch = pctCh(tM.before, tM.after);
            if (ch !== null)
                parts.push(ch <= -20 ? `✅ Raw view: <strong>${site}</strong> avg daily CPU dropped <strong>${Math.abs(ch).toFixed(0)}%</strong> (${fmtN(tM.before)} → ${fmtN(tM.after)} CPU sec/day).` : ch < 0 ? `⚠️ Raw view: <strong>${site}</strong> modest decrease of ${Math.abs(ch).toFixed(0)}%.` : `🔴 Raw view: <strong>${site}</strong> CPU <em>increased</em> ${ch.toFixed(0)}% — fix may not have had the intended effect.`);
        }
        if (cM && tM) {
            const tc = pctCh(tM.before, tM.after)
              , cc = pctCh(cM.before, cM.after);
            if (tc !== null && cc !== null) {
                if (tc < 0 && cc >= 0)
                    parts.push(`✅ Control group flat/rising <strong>(${signStr(cc)})</strong> — rules out ambient traffic reduction. Drop on <strong>${site}</strong> is site-specific.`);
                else if (tc < 0 && cc < 0 && Math.abs(tc) > Math.abs(cc) * 1.5)
                    parts.push(`⚠️ Both dropped, but target fell ${Math.abs(tc).toFixed(0)}% vs control ${Math.abs(cc).toFixed(0)}% — fix likely contributed beyond background noise.`);
                else if (tc < 0 && cc < 0)
                    parts.push(`⚠️ Both target and control fell at similar rates — some improvement may reflect general traffic reduction rather than the fix.`);
            }
        }
        if (sM) {
            const ch = pctCh(sM.before, sM.after);
            if (ch !== null && ch < -10)
                parts.push(`✅ Account share: <strong>${fmtD(sM.before)}% → ${fmtD(sM.after)}%</strong> — site became proportionally less dominant on shared resources.`);
        }
        if (eM && ceM) {
            const ec = pctCh(eM.before, eM.after)
              , cc2 = pctCh(ceM.before, ceM.after);
            if (ec !== null && cc2 !== null) {
                const flatExec = Math.abs(ec) < 8;
                const flatCost = Math.abs(cc2) < 8;
                if (ec < -10 && cc2 <= -10)
                    parts.push(`✅ <strong>Both lower</strong>: executions ${signStr(ec)} <em>and</em> CPU/exec ${signStr(cc2)} — fix reduced both request volume and per-request cost.`);
                else if (cc2 < -10 && flatExec)
                    parts.push(`✅ <strong>Cost win, volume steady</strong>: executions only changed ${signStr(ec)} but CPU/exec dropped ${Math.abs(cc2).toFixed(0)}% — same traffic, each request now cheaper. This is the cleanest kind of fix (no users blocked).`);
                else if (ec < -10 && flatCost)
                    parts.push(`✅ <strong>Volume win, cost steady</strong>: CPU/exec unchanged (${signStr(cc2)}) but executions fell ${Math.abs(ec).toFixed(0)}% — fix is blocking requests before PHP runs (early-intercept, cache, WAF rule, etc.).`);
                else if (cc2 < -10)
                    parts.push(`✅ CPU/exec dropped ${Math.abs(cc2).toFixed(0)}% — each request now cheaper.`);
                else if (cc2 > 10 && ec < 0)
                    parts.push(`⚠️ Executions fell ${Math.abs(ec).toFixed(0)}% but CPU/exec <em>rose</em> ${cc2.toFixed(0)}% — fewer requests but each one heavier. Possibly the cheap requests got blocked while expensive ones remain. Investigate.`);
            }
        }
        if (cmp.aDates.length < 3)
            parts.push(`⚠️ Only <strong>${cmp.aDates.length} complete after-day${cmp.aDates.length === 1 ? '' : 's'}</strong>. 5–7 days recommended before presenting to management.`);
        if (cmp.stat) {
            const {p, diff, ci95, df} = cmp.stat;
            const sig = p < 0.01 ? '✅ <strong>statistically significant</strong>' : p < 0.05 ? '✅ statistically significant' : p < 0.1 ? '⚠️ marginally significant' : '🔴 <strong>not statistically significant</strong>';
            const dir = diff < 0 ? 'drop' : 'rise';
            parts.push(`${sig} (Welch's t-test, p=${p < 0.001 ? '<0.001' : p.toFixed(3)}, df=${df.toFixed(1)}). The ${dir} of ${fmtN(Math.abs(diff))} CPU sec/day has 95% CI [${fmtN(ci95[0])}, ${fmtN(ci95[1])}]${ci95[0] * ci95[1] < 0 ? ' — CI crosses zero, so direction is uncertain' : ''}.`);
        }
        return parts;
    }
    ;

    const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
/* ── THEME VARIABLES — Cobblestone Learning brand ──────────────────────────
   LIGHT is the default theme and the canonical brand look (per brand guidelines):
     • white surfaces, body text #3D3D3D, borders #E8ECF0
     • cyan #27AAE1 as the signature accent — used as 3px top borders on hero cards,
       3px left borders on active table rows, and bottom-border separators
     • soft shadows for surface lift, no glow
   DARK is independently designed for after-hours analyst work, NOT a lazy inversion:
     • deep blue-grey ground (#0F1419), cards lifted with 1px white-alpha border
     • cyan-glow accents (lighter borders + subtle outer glow) instead of top bars
     • saturated accent colours to read clearly against dark surfaces
   Both share Montserrat typography and the same accent palette. Everything else differs. */

/* ── LIGHT (default) ── */
#sgd, .sgd-wait, #sgd-tt, .drill-modal {
  --bg: #F8F9FB; --bg-card: #FFFFFF; --bg-card-alt: #F8F9FB;
  --bg-input: #FFFFFF; --bg-header: linear-gradient(135deg,#FFFFFF,#F0F8FC);
  --bg-tab: #FFFFFF;
  --text: #3D3D3D; --text-strong: #1A1A1A; --text-muted: #555E68;
  --text-dim: #6e7785; --text-faint: #939393; --text-ghost: #B5BCC4;
  --text-meta: #D8DEE5;
  --border: #E8ECF0; --border-strong: #C5CDD6;
  --border-faint: #F0F2F5;
  --hover-row: rgba(39,170,225,0.035);
  --row-hi: rgba(39,170,225,0.07);
  --shadow: 0 4px 18px rgba(61,61,61,0.06);
  --shadow-card: 0 1px 2px rgba(61,61,61,0.04);
  --shadow-hero: 0 4px 14px rgba(39,170,225,0.10);
  --accent: #27AAE1; --accent-strong: #0074B4;
  --accent-bg: rgba(39,170,225,0.06); --accent-border: rgba(39,170,225,0.28); --accent-glow: none;
  --accent-bar: 3px solid #27AAE1;
  --ok: #2D9E5A; --ok-bg: #F0FAF3; --ok-border: #B7E4C5; --ok-text: #1B6E3E;
  --warn: #B07000; --warn-bg: #FFF8E1; --warn-border: #F0D98C; --warn-text: #6E4A00;
  --crit: #C0392B; --crit-bg: #FCEAE7; --crit-border: #F1C0BA; --crit-text: #7F2419;
  --info-bg: #E8F4FC; --info-border: #B5DBEE; --info-text: #0074B4;
  --interp-bg: #F2F8FC;
  --tooltip-bg: #3D3D3D; --tooltip-text: #FFFFFF; --tooltip-border: rgba(39,170,225,0.6);
  --chart-text: #555E68; --chart-axis: #D8DEE5; --chart-grid: #F0F2F5;
  --chart-tooltip-bg: #3D3D3D; --chart-tooltip-text: #FFFFFF;
  /* Spacing & sizing tokens — pulled out so a single bump rebalances the whole UI.
     --pad-body uses clamp() so horizontal padding scales with viewport (~5vw on big screens,
     never less than 18px on phones, never more than 80px). Combined with --max-content-w
     this gives breathing room on every screen size. */
  --pad-body-v: 28px; --pad-body-h: clamp(18px, 5vw, 80px);
  --pad-body: var(--pad-body-v) var(--pad-body-h) calc(var(--pad-body-v) * 2);
  --pad-card: 22px 26px; --pad-card-sm: 16px 18px;
  --max-content-w: 1180px;
  --gap-cards: 22px; --gap-row: 16px; --gap-tight: 10px;
  --sec-gap: 28px;
  --radius: 14px; --radius-sm: 10px; --radius-pill: 999px;
  --fs-base: 13.5px; --fs-sm: 12.5px; --fs-xs: 11.5px; --fs-xxs: 10.5px;
}
/* ── DARK (analyst mode) — designed independently from light, not just an inversion ── */
#sgd[data-theme="dark"], .sgd-wait[data-theme="dark"], #sgd-tt[data-theme="dark"], .drill-modal[data-theme="dark"] {
  --bg: #0F1419; --bg-card: #1A2230; --bg-card-alt: #131923;
  --bg-input: #131923; --bg-header: linear-gradient(135deg,#0F1419,#102640);
  --bg-tab: #1A2230;
  --text: #E8EEF5; --text-strong: #FFFFFF; --text-muted: #B5C0CC;
  --text-dim: #8A95A2; --text-faint: #6B7682; --text-ghost: #4A5562;
  --text-meta: #3A434F;
  --border: rgba(255,255,255,0.07); --border-strong: rgba(39,170,225,0.35);
  --border-faint: rgba(255,255,255,0.04);
  --hover-row: rgba(255,255,255,0.025);
  --row-hi: rgba(39,170,225,0.10);
  --shadow: 0 14px 48px rgba(0,0,0,0.55);
  --shadow-card: 0 1px 0 rgba(255,255,255,0.03) inset;
  --shadow-hero: 0 0 0 1px rgba(39,170,225,0.25), 0 8px 28px rgba(0,116,180,0.18);
  --accent: #4DBFEF; --accent-strong: #27AAE1;
  --accent-bg: rgba(39,170,225,0.10); --accent-border: rgba(39,170,225,0.40); --accent-glow: 0 0 12px rgba(39,170,225,0.35);
  --accent-bar: 1px solid rgba(39,170,225,0.45);
  --ok: #5CCC87; --ok-bg: rgba(45,158,90,0.14); --ok-border: rgba(92,204,135,0.35); --ok-text: #B8E4CC;
  --warn: #FFC20E; --warn-bg: rgba(255,194,14,0.12); --warn-border: rgba(255,194,14,0.34); --warn-text: #FFE28A;
  --crit: #F26352; --crit-bg: rgba(242,99,82,0.14); --crit-border: rgba(242,99,82,0.40); --crit-text: #F8B8AD;
  --info-bg: rgba(77,191,239,0.10); --info-border: rgba(77,191,239,0.30); --info-text: #B8E0F2;
  --interp-bg: rgba(0,116,180,0.10);
  --tooltip-bg: #131923; --tooltip-text: #E8EEF5; --tooltip-border: rgba(77,191,239,0.4);
  --chart-text: #8A95A2; --chart-axis: rgba(255,255,255,0.08); --chart-grid: rgba(255,255,255,0.04);
  --chart-tooltip-bg: #131923; --chart-tooltip-text: #E8EEF5;
}

/* ── LAYOUT & BASE ──────────────────────────────────────────────────────── */
#sgd{position:fixed;inset:0;z-index:2147483647;background:var(--bg);color:var(--text);font-family:'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:var(--fs-base);line-height:1.55;font-feature-settings:'cv11','ss01';display:flex;flex-direction:column;overflow:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
#sgd-tt,.sgd-wait,.drill-modal{font-family:'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}
/* Surgical resets — only zero out browser defaults where our own component CSS expects them
   to be zero. The previous universal selector with margin/padding zeroed was clobbering every
   element-level spacing token elsewhere in the stylesheet. This targeted version preserves them. */
#sgd *{box-sizing:border-box}
#sgd h1,#sgd h2,#sgd h3,#sgd h4,#sgd h5,#sgd h6,#sgd p,#sgd figure,#sgd blockquote,#sgd dl,#sgd dd{margin:0}
#sgd button{font-family:inherit;font-size:inherit;color:inherit;cursor:pointer}
#sgd input,#sgd select,#sgd textarea{font-family:inherit;font-size:inherit;color:inherit}
#sgd select{appearance:none;-webkit-appearance:none;-moz-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%2327AAE1' d='M6 8L0 0h12z'/></svg>");background-repeat:no-repeat;background-position:right 10px center;padding-right:30px}
#sgd ul,#sgd ol{margin:0;padding:0;list-style:none}
#sgd a{color:var(--accent-strong);text-decoration:none}
#sgd a:hover{text-decoration:underline}
#sgd img{max-width:100%;display:block}
#sgd table{border-spacing:0}
#sgd fieldset{border:0;margin:0;padding:0}
#sgd hr{border:0;border-top:1px solid var(--border);margin:var(--gap-cards) 0}
.sgd-hdr{padding:16px 0;background:var(--bg-header);border-bottom:3px solid var(--accent);flex-shrink:0}
.sgd-brand{display:inline-flex;align-items:center;text-decoration:none;flex-shrink:0;height:38px}
.sgd-brand img{height:100%;width:auto;display:block;object-fit:contain;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.05))}
.sgd-brand-titles{display:flex;flex-direction:column;line-height:1.1;margin-right:6px;flex-shrink:0}
.sgd-hdr h1{font-size:16px;font-weight:700;color:var(--text-strong);white-space:nowrap;letter-spacing:-.01em;line-height:1.15}
.sgd-brand-tag{font-size:10px;font-weight:600;color:var(--accent);letter-spacing:.08em;text-transform:uppercase;margin-top:3px}
.sgd-hdr-sub{font-size:12px;color:var(--text-faint);flex:1;min-width:160px}
.sgd-hdr-acts{display:flex;gap:6px;align-items:center;margin-left:auto}
.theme-toggle{background:transparent;border:1px solid var(--border-strong);color:var(--text-muted);width:30px;height:30px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;transition:all .15s}
.theme-toggle:hover{color:var(--accent);border-color:var(--accent);background:var(--accent-bg)}
.theme-toggle.on{color:var(--accent);border-color:var(--accent);background:var(--accent-bg)}
.excl-chip{background:transparent;border:1px solid var(--border-strong);color:var(--text-muted);padding:7px 12px;border-radius:var(--radius-pill);font-size:11.5px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:5px;transition:all .15s}
.excl-chip:hover{color:var(--accent);border-color:var(--accent);background:var(--accent-bg)}
.excl-chip.has{color:var(--warn);border-color:var(--warn-border);background:var(--warn-bg)}
.excl-chip.has:hover{color:var(--warn-text)}
.excl-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--warn-bg);border:1px solid var(--warn-border);color:var(--warn-text);padding:11px 16px;border-radius:var(--radius-sm);font-size:12px;margin-bottom:var(--gap-cards)}
.excl-row .ex-list{display:flex;flex-wrap:wrap;gap:6px;flex:1}
.excl-row .ex-pill{display:inline-flex;align-items:center;gap:6px;background:var(--bg-card);border:1px solid var(--warn-border);color:var(--text);padding:3px 4px 3px 10px;border-radius:var(--radius-pill);font-size:11px;font-weight:500}
.excl-row .ex-pill button{background:transparent;border:0;color:var(--text-faint);cursor:pointer;font-size:14px;line-height:1;padding:0 6px;border-radius:50%}
.excl-row .ex-pill button:hover{color:var(--crit);background:var(--crit-bg)}
.excl-row .ex-clear{background:transparent;border:1px solid currentColor;color:inherit;padding:5px 12px;border-radius:7px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:600}
.excl-row .ex-clear:hover{background:rgba(0,0,0,0.05)}
tr.excluded-site td{opacity:.45;background:repeating-linear-gradient(45deg,transparent,transparent 6px,var(--warn-bg) 6px,var(--warn-bg) 12px)}
.row-action-btn{background:transparent;border:1px solid var(--border);color:var(--text-faint);padding:3px 9px;border-radius:var(--radius-pill);font-size:10.5px;cursor:pointer;font-family:inherit;transition:all .15s}
.row-action-btn:hover{color:var(--accent);border-color:var(--accent);background:var(--accent-bg)}
.row-action-btn.is-excl{color:var(--warn);border-color:var(--warn-border);background:var(--warn-bg)}
.guide-wrap{display:grid;grid-template-columns:220px 1fr;gap:32px;max-width:var(--max-content-w);margin:0 auto}
@media (max-width: 900px){.guide-wrap{grid-template-columns:1fr}.guide-toc{position:static !important}}
.guide-toc{position:sticky;top:14px;align-self:start;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 16px;max-height:calc(100vh - 120px);overflow-y:auto}
.guide-toc-h{font-size:10.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border-faint)}
.guide-toc-link{display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:var(--text-muted);padding:7px 9px;border-radius:var(--radius-sm);font-size:12.5px;font-weight:500;margin-bottom:2px}
.guide-toc-link:hover{background:var(--accent-bg);color:var(--accent)}
.guide-toc-foot{margin-top:14px;padding-top:14px;border-top:1px solid var(--border-faint);font-size:11.5px;color:var(--text-faint);line-height:1.65}
.guide-intro{margin-bottom:36px;padding-bottom:24px;border-bottom:1px solid var(--border-faint)}
.guide-intro h1{font-size:26px;font-weight:800;color:var(--text-strong);margin-bottom:8px;letter-spacing:-.02em}
.guide-intro p{font-size:14px;color:var(--text-muted);line-height:1.65;max-width:680px}
.guide-section{margin-bottom:48px}
.guide-section-h{font-size:18px;font-weight:700;color:var(--text-strong);margin-bottom:18px;padding:10px 0 12px;border-bottom:2px solid var(--accent-border)}
.guide-items{display:flex;flex-direction:column;gap:18px}
.guide-item{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px}
.guide-item-h{display:flex;align-items:baseline;justify-content:space-between;gap:14px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border-faint)}
.guide-item-title{font-size:17px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em}
.guide-item-key{font-size:11px;color:var(--text-faint);background:var(--bg-card-alt);padding:3px 8px;border-radius:var(--radius-pill);font-family:ui-monospace,monospace}
.guide-block{display:grid;grid-template-columns:140px 1fr;gap:16px;align-items:start;padding:8px 0;font-size:13px;line-height:1.65}
.guide-block + .guide-block{border-top:1px dashed var(--border-faint)}
.guide-block-h{font-size:10.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;padding-top:2px}
.guide-block.layman .guide-block-h{color:var(--accent)}
.guide-block.tech .guide-block-h{color:var(--text-dim)}
.guide-block.when .guide-block-h{color:var(--warn)}
.guide-block.where .guide-block-h{color:var(--ok)}
.guide-block.sev .guide-block-h{color:var(--crit)}
.guide-block-body{color:var(--text-muted)}
.guide-block-body code{background:var(--bg-card-alt);padding:2px 6px;border-radius:4px;font-size:11.5px;border:1px solid var(--border-faint);font-family:ui-monospace,monospace}
.guide-block-body strong{color:var(--text-strong)}
@media (max-width: 700px){.guide-block{grid-template-columns:1fr;gap:4px}.guide-block-h{padding-top:0}}
.avail-bar{display:flex;gap:4px;flex-wrap:wrap}
.av-b{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:var(--radius-pill);font-size:10.5px;font-weight:700;background:var(--bg-card-alt);border:1px solid var(--border);color:var(--text-meta);transition:all .3s}
.av-b.on{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok)}
.av-b .dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.sgd-tabs{display:block;padding:0;background:var(--bg-tab);border-bottom:1px solid var(--border);flex-shrink:0}
.sgd-tab{padding:14px 22px;font-size:13.5px;font-weight:600;color:var(--text-faint);cursor:pointer;border:none;background:none;border-bottom:3px solid transparent;margin-bottom:-1px;transition:color .15s,border-color .15s;white-space:nowrap;flex-shrink:0;letter-spacing:.01em}
.sgd-tab:hover{color:var(--text-muted)} .sgd-tab.on{color:var(--accent);border-bottom-color:var(--accent)}
/* Body: scrolling region with clamp()-based horizontal padding.
   Every direct child of the body is capped at --max-content-w and centered horizontally —
   so on wide monitors there's real whitespace either side; on narrow laptops the padding
   provides the breathing room while the content uses the remaining width. */
.sgd-body{overflow-y:auto;flex:1;padding:var(--pad-body);scroll-behavior:smooth;overscroll-behavior:contain}
.sgd-body > *{max-width:var(--max-content-w);margin-left:auto !important;margin-right:auto !important;box-sizing:border-box}
/* The header content sits in a centered max-width column so the logo/title align vertically
   with the content cards in the body. The tab nav has the same outer padding but its inner
   flow is full-width — tabs spread naturally edge-to-edge with the active underline reading
   correctly across the page. */
.sgd-hdr,.sgd-tabs{padding-left:var(--pad-body-h);padding-right:var(--pad-body-h)}
.sgd-hdr-inner{max-width:var(--max-content-w);margin:0 auto;width:100%;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
/* Header-specific compaction: zero out every descendant's padding/margin so the strip stays
   on one line, then opt-in to padding ONLY for the buttons that need it. This is the right
   place for a wildcard reset — the header is a tight horizontal strip where defaults from
   component classes are too generous. */
.sgd-hdr-inner *{padding:0;margin:0}
.sgd-hdr-inner .sgd-hdr-acts{margin-left:auto;display:flex;align-items:center;gap:6px}
.sgd-hdr-inner .btn.sm{padding:6px 11px;font-size:11.5px;border-radius:7px}
.sgd-hdr-inner .theme-toggle{width:28px;height:28px;border-radius:7px;font-size:13px;display:inline-flex;align-items:center;justify-content:center}
.sgd-hdr-inner .excl-chip{padding:5px 11px;font-size:11.5px;display:inline-flex;align-items:center;gap:5px;border-radius:var(--radius-pill)}
.sgd-hdr-inner .av-b{padding:3px 8px;font-size:9.5px;display:inline-flex;align-items:center;gap:4px;border-radius:var(--radius-pill)}
.sgd-hdr-inner h1{font-size:14.5px;line-height:1.2}
.sgd-hdr-inner .sgd-brand-tag{font-size:9.5px;letter-spacing:.08em}
.sgd-hdr-inner .sgd-brand-titles{display:flex;flex-direction:column;line-height:1.1}
.sgd-hdr-inner .avail-bar{display:flex;gap:3px;flex-wrap:wrap}
.sgd-tabs-inner{display:flex;flex-wrap:nowrap;gap:2px;width:100%;overflow-x:auto}

/* ── INTRO / NOVICE PANEL (collapsible per-tab) ─────────────────────────── */
.intro-card{background:linear-gradient(135deg,var(--bg-card),var(--bg-card-alt));border:1px solid var(--accent-border);border-radius:var(--radius);padding:24px 28px;margin-bottom:var(--sec-gap);display:flex;align-items:flex-start;gap:18px;box-shadow:0 1px 4px rgba(0,0,0,0.05)}
.intro-card .ico{font-size:32px;flex-shrink:0;line-height:1;padding-top:2px}
.intro-card .body{flex:1;font-size:13.5px;line-height:1.7;color:var(--text-muted)}
.intro-card .body strong{color:var(--text-strong)}
.intro-card .body h4{font-size:16px;font-weight:700;color:var(--text-strong);margin-bottom:9px;letter-spacing:-.01em}
.intro-card details{margin-top:14px}
.intro-card details summary{cursor:pointer;color:var(--accent);font-size:12.5px;font-weight:600;list-style:none;user-select:none;padding:6px 0}
.intro-card details summary::-webkit-details-marker{display:none}
.intro-card details summary::before{content:'▸ ';display:inline-block;transition:transform .15s}
.intro-card details[open] summary::before{transform:rotate(90deg)}
.intro-card details .more{margin-top:12px;padding-top:14px;border-top:1px solid var(--border);font-size:12.5px;color:var(--text-muted);line-height:1.75}
.intro-card details .more ul{padding-left:0;list-style:none}
.intro-card details .more li{margin-bottom:8px;padding-left:20px;position:relative}
.intro-card details .more li::before{content:'•';position:absolute;left:6px;color:var(--accent);font-weight:bold}

.sbar{padding:14px 18px;border-radius:var(--radius-sm);margin-bottom:var(--gap-cards);font-size:12.5px;line-height:1.65;background:var(--info-bg);border:1px solid var(--info-border);color:var(--info-text)}
.sbar.warn{background:var(--warn-bg);border-color:var(--warn-border);color:var(--warn-text)}
.sbar.crit{background:var(--crit-bg);border-color:var(--crit-border);color:var(--crit-text)}
.sbar.ok{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok-text)}
.hbanner{border-radius:var(--radius);padding:24px 28px;margin-bottom:var(--sec-gap);display:flex;align-items:center;gap:24px;background:var(--bg-card);border:1px solid var(--border);border-top:var(--accent-bar);box-shadow:var(--shadow-hero)}
.hbanner.warn{border-color:var(--warn-border)}
.hbanner.crit{border-color:var(--crit-border)}
.hbanner.ok{border-color:var(--ok-border)}
.hb-icon{font-size:36px;flex-shrink:0}
.hb-score{font-size:48px;font-weight:900;line-height:1;flex-shrink:0;letter-spacing:-.03em}
.hb-score.ok{color:var(--ok)} .hb-score.warn{color:var(--warn)} .hb-score.crit{color:var(--crit)}
.hb-text h2{font-size:17px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em}
.hb-text p{font-size:13px;color:var(--text-muted);margin-top:6px;line-height:1.6}

.gauges{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--gap-cards);margin-bottom:var(--sec-gap)}
.gc{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px 18px 18px;text-align:center;cursor:default}
.gw{display:inline-block}
.gmeta{display:flex;justify-content:space-around;margin-top:4px;font-size:10px;color:var(--text-ghost);padding:0 4px}
.gmeta span{display:flex;flex-direction:column;align-items:center;gap:1px}
.gmeta b{font-size:11.5px;font-weight:700;color:var(--text-faint)}
.gok{color:var(--ok)!important} .gwarn{color:var(--warn)!important} .gcrit{color:var(--crit)!important}

.baro-row{display:grid;grid-template-columns:1fr 1fr;gap:var(--gap-cards);margin-bottom:var(--sec-gap)}
.baro-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px}
.baro-t{font-size:11.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:14px;display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid var(--border-faint)}
.alert-list{display:flex;flex-direction:column;gap:10px;max-height:220px;overflow-y:auto;padding-right:4px}
.alert-item{display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:var(--radius-sm);font-size:12px;line-height:1.65}
.alert-item.ok{background:var(--ok-bg);border:1px solid var(--ok-border);color:var(--ok-text)}
.alert-item.warn{background:var(--warn-bg);border:1px solid var(--warn-border);color:var(--warn-text)}
.alert-item.crit{background:var(--crit-bg);border:1px solid var(--crit-border);color:var(--crit-text)}
.alert-item strong{color:var(--text-strong)} .alert-ico{flex-shrink:0;margin-top:1px}

.ctrl-row{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:var(--gap-cards)}
.fld{display:flex;flex-direction:column;gap:6px}
.fld label{font-size:10.5px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:5px}
.fld input,.fld select{background:var(--bg-input);border:1px solid var(--border-strong);border-radius:8px;color:var(--text);padding:10px 14px;font-size:12.5px;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
.fld input:focus,.fld select:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg)}
.fld select{cursor:pointer;min-width:140px}
.btn{padding:10px 18px;border-radius:8px;font-size:12.5px;font-weight:700;cursor:pointer;border:1px solid var(--border-strong);background:var(--accent-strong);color:#fff;white-space:nowrap;transition:filter .15s,transform .05s;font-family:inherit;letter-spacing:.01em}
.btn:hover{filter:brightness(1.08)} .btn:active{transform:translateY(1px)}
.btn.sec{background:var(--bg-card-alt);color:var(--text);border-color:var(--border)}
.btn.sm{padding:7px 14px;font-size:11.5px}
.btn.danger{background:var(--crit);color:#fff;border-color:var(--crit)}
.step-toggle{display:flex;gap:2px;background:var(--bg-card-alt);border:1px solid var(--border);border-radius:8px;padding:3px}
.step-btn{padding:5px 12px;border-radius:6px;font-size:11.5px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--text-dim);transition:all .15s}
.step-btn:hover{color:var(--text-muted)} .step-btn.on{background:var(--accent-bg);color:var(--accent)} .step-btn:disabled{opacity:.3;cursor:not-allowed}

.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:14px}
.kpi{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:13px 14px}
.kpi-t{font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;display:flex;align-items:center;gap:4px}
.kpi-v{font-size:22px;font-weight:800;color:var(--text-strong);line-height:1;margin-bottom:3px}
.kpi-s{font-size:11px;color:var(--text-faint);line-height:1.45}

.cw{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:var(--pad-card);margin-bottom:var(--gap-cards);box-shadow:var(--shadow-card)}
.cw-t{font-size:13.5px;font-weight:700;color:var(--text-strong);margin-bottom:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:2px solid var(--accent-border)}
.cw-hint{display:block;font-size:12px;color:var(--text-muted);font-weight:400;margin-top:6px;line-height:1.6;flex-basis:100%}
#sgd.explain-off .layman-sub{display:none}
.layman-sub{display:block;font-size:12px;font-weight:400;color:var(--text-muted);margin-top:6px;line-height:1.55;font-style:italic;letter-spacing:0;text-transform:none}
.layman-sub::before{content:'💡 ';font-style:normal;opacity:.7;margin-right:2px}
.layman-sub strong{color:var(--text-strong);font-weight:600}
.ch{width:100%;height:360px;margin-top:6px} .ch.tall{height:440px} .ch.xl{height:500px} .ch.sm{height:220px}
.sec{margin-top:var(--sec-gap);margin-bottom:var(--sec-gap)}
.sec-t{font-size:14.5px;font-weight:700;color:var(--text-strong);margin-bottom:14px;display:flex;align-items:center;gap:8px;padding-bottom:12px;border-bottom:3px solid var(--accent);letter-spacing:-.005em}
.tw{overflow:auto;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);max-height:460px}
table{width:100%;border-collapse:collapse;font-size:12.5px;white-space:nowrap}
th{position:sticky;top:0;z-index:1;background:var(--bg-card);color:var(--text-faint);padding:14px 16px;text-align:left;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid var(--accent);cursor:pointer;user-select:none}
th:hover{color:var(--text-muted)} th.sk{color:var(--accent)}
td{padding:12px 16px;border-bottom:1px solid var(--border-faint);color:var(--text);vertical-align:middle;line-height:1.5}
tr:hover td{background:var(--hover-row)}
tr.hi td{background:var(--row-hi)}
tr.hi td:first-child{box-shadow:inset 3px 0 0 var(--accent)}
tr.incomplete td{opacity:.45}
.r{text-align:right;font-variant-numeric:tabular-nums}
.mono{font-family:ui-monospace,monospace;font-size:11.5px}
.cg{color:var(--ok)} .cr{color:var(--crit)} .cn{color:var(--accent)} .cd{color:var(--text-ghost)} .cw2{color:var(--warn)}

.cmps{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:var(--gap-cards);margin-bottom:var(--sec-gap)}
.cmp-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;transition:border-color .15s,background .15s}
.cmp-card:hover{border-color:var(--border-strong);background:var(--bg-card-alt)}
.cmp-t{font-size:10.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:9px;display:flex;align-items:center;gap:5px}
.cmp-v{font-size:26px;font-weight:800;line-height:1;margin-bottom:8px;letter-spacing:-.02em}
.cmp-d{font-size:11.5px;color:var(--text-muted);line-height:1.5} .cmp-desc{font-size:11px;color:var(--text-faint);margin-top:5px;font-style:italic;line-height:1.5}
.net-hero{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:18px 26px;background:var(--bg-card);border:1px solid var(--border);border-top:var(--accent-bar);border-radius:var(--radius);padding:22px 26px;margin-bottom:var(--gap-cards);box-shadow:var(--shadow-hero)}
.net-hero .nh-foot{grid-column:1 / -1;font-size:12px;color:var(--text-muted);line-height:1.65;padding-top:10px;border-top:1px dashed var(--border-faint);margin-top:4px}
.net-hero .nh-foot strong{color:var(--text-strong)}
.net-hero .nh-lbl{font-size:10.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px;display:flex;align-items:center;gap:4px}
.net-hero .nh-big{font-size:34px;font-weight:800;line-height:1;margin-bottom:6px;letter-spacing:-.02em}
.net-hero .nh-sub{font-size:11.5px;color:var(--text-muted);line-height:1.55}
.net-hero .nh-sub strong{color:var(--text-strong)}
.net-hero .nh-mini{font-size:11px;color:var(--text-faint);margin-top:5px}
.net-hero .nh-row{display:flex;flex-direction:column;justify-content:center}
.net-hero .nh-pair{display:flex;align-items:baseline;gap:8px}
.net-hero .nh-pair .nh-num{font-size:22px;font-weight:800;line-height:1}
.net-hero .nh-pair .nh-pc{font-size:13px;font-weight:700}
@media (max-width: 760px){.net-hero{grid-template-columns:1fr;gap:10px}}
/* ── Fix Focus hero — adapts to the chosen metric the user is trying to demonstrate ── */
.focus-hero{background:var(--bg-card);border:1px solid var(--border);border-top:var(--accent-bar);border-radius:var(--radius);padding:20px 24px;margin-bottom:var(--gap-cards);box-shadow:var(--shadow-hero)}
.focus-hero.noop{background:var(--warn-bg);border-color:var(--warn-border);color:var(--warn-text);padding:14px 18px;font-size:12.5px}
.focus-hero .fh-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding-bottom:14px;border-bottom:1px dashed var(--border-faint);margin-bottom:14px}
.focus-hero .fh-eyebrow{font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:4px}
.focus-hero .fh-title{font-size:18px;font-weight:800;margin:0;line-height:1.2;letter-spacing:-.01em;color:var(--text-strong)}
.focus-hero .fh-hero-num{font-size:32px;font-weight:800;letter-spacing:-.02em;line-height:1;display:flex;flex-direction:column;align-items:flex-end;gap:3px;min-width:140px;text-align:right}
.focus-hero .fh-hero-unit{font-size:10px;font-weight:600;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em}
.focus-hero .fh-body{display:flex;flex-direction:column;gap:9px;margin-bottom:14px}
.focus-hero .fh-row{display:grid;grid-template-columns:1.2fr 2fr;gap:14px;align-items:center;padding:10px 12px;border-radius:var(--radius-sm);background:var(--bg-card-alt)}
.focus-hero .fh-row-lbl{font-size:12px;font-weight:600;color:var(--text-muted)}
.focus-hero .fh-row-vals{display:flex;align-items:center;justify-content:space-between;gap:10px}
.focus-hero .fh-row-pair{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--text-strong)}
.focus-hero .fh-row-ch{font-size:13px;font-weight:800;font-variant-numeric:tabular-nums}
.focus-hero .fh-verdict{padding:11px 14px;border-radius:var(--radius-sm);font-size:12.5px;line-height:1.55;background:var(--bg-card-alt);border-left:3px solid var(--accent)}
.focus-hero .fh-verdict.cg{border-left-color:var(--ok);background:var(--ok-bg);color:var(--ok-text)}
.focus-hero .fh-verdict.cr{border-left-color:var(--crit);background:var(--crit-bg);color:var(--crit-text)}
.focus-hero .fh-verdict.cw2{border-left-color:var(--warn);background:var(--warn-bg);color:var(--warn-text)}
.focus-hero .fh-counter{font-size:11.5px;color:var(--text-muted);padding:8px 12px;margin-top:8px;background:var(--bg-card-alt);border-radius:var(--radius-sm);line-height:1.55}
.focus-hero .fh-note{font-size:11px;color:var(--text-faint);padding:8px 12px;background:var(--info-bg);color:var(--info-text);border-radius:var(--radius-sm);margin-bottom:10px;line-height:1.55}
.focus-hero .fh-mini-rank{margin-top:14px;padding-top:12px;border-top:1px dashed var(--border-faint)}
.focus-hero .fh-mini-h{font-size:10.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px}
.focus-hero .fh-mini-list{margin:0;padding-left:14px;font-size:12px;color:var(--text-muted);line-height:1.7}
.focus-hero .fh-mini-list li{font-variant-numeric:tabular-nums}
.focus-hero .fh-mini-list .fh-mini-ch{font-weight:700;margin-left:6px}
.focus-hero .fh-mini-list .fh-mini-tgt{margin-top:4px;color:var(--text-strong)}
.focus-hero .combo-tbl{width:100%;border-collapse:collapse;font-size:12px}
.focus-hero .combo-tbl th{padding:7px 9px;font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border)}
.focus-hero .combo-tbl td{padding:9px 9px;border-bottom:1px solid var(--border-faint);font-variant-numeric:tabular-nums}
.focus-hero .combo-tbl td.r{text-align:right;font-weight:600}
.focus-hero .combo-tbl tr.combo-server td{color:var(--text-faint)}
.focus-hero .combo-tbl .combo-ext{color:var(--text-faint);font-size:11px;font-weight:500}
.filter-ctx{background:var(--info-bg);border:1px solid var(--info-border);color:var(--info-text);font-size:11.5px;padding:7px 13px;border-radius:var(--radius-sm);margin-bottom:var(--gap-cards)}
.filter-ctx strong{color:var(--info-text)}
.adv-toggle{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-muted);font-weight:600;cursor:pointer;user-select:none}
.adv-toggle input{accent-color:var(--accent);cursor:pointer}
@media (max-width: 760px){.focus-hero .fh-head{flex-direction:column;align-items:flex-start;gap:10px}.focus-hero .fh-hero-num{align-items:flex-start;text-align:left}.focus-hero .fh-row{grid-template-columns:1fr}}
.lens-row-strip{background:var(--bg-card);border:1px solid var(--border);border-top:var(--accent-bar);border-radius:var(--radius);padding:18px 22px;margin-bottom:var(--gap-cards);box-shadow:var(--shadow-hero)}
.lens-strip-h{font-size:13px;font-weight:700;color:var(--text-strong);margin-bottom:14px;display:flex;align-items:baseline;flex-wrap:wrap;gap:10px}
.lens-strip-sub{font-size:11px;font-weight:400;color:var(--text-muted);line-height:1.5;flex:1;min-width:280px}
.lens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.lens-card{background:var(--bg-card-alt);border:1px solid var(--border-faint);border-radius:var(--radius-sm);padding:14px 16px}
.lens-card.lens-primary{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent-border),var(--shadow-card);background:var(--accent-bg)}
.lens-primary-badge{margin-left:auto;background:var(--accent);color:#fff;font-size:8.5px;font-weight:700;padding:2px 7px;border-radius:var(--radius-pill);text-transform:uppercase;letter-spacing:.04em}
.lens-card-h{font-size:11px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;display:flex;align-items:center;gap:5px}
.lens-card-unit{color:var(--text-ghost);font-weight:500;text-transform:none;letter-spacing:0}
.lens-card-hero{font-size:30px;font-weight:800;line-height:1;letter-spacing:-.02em;margin-bottom:4px}
.lens-card-verdict{font-size:11.5px;color:var(--text-muted);line-height:1.5;margin-bottom:12px;padding-bottom:10px;border-bottom:1px dashed var(--border-faint)}
.lens-rows{display:flex;flex-direction:column;gap:7px}
.lens-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:baseline}
.lens-row-lbl{font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lens-row-vals{display:flex;align-items:baseline;gap:6px}
.lens-row-pair{font-size:11.5px;color:var(--text-strong);font-variant-numeric:tabular-nums;font-weight:600}
.lens-row-ch{font-size:11.5px;font-weight:700;min-width:55px;text-align:right;font-variant-numeric:tabular-nums}
@media (max-width: 980px){.lens-grid{grid-template-columns:1fr}}
.excl-banner{background:var(--warn-bg);border:1px solid var(--warn-border);color:var(--warn);font-size:11.5px;padding:9px 14px;border-radius:var(--radius-sm);margin-bottom:var(--gap-cards);cursor:pointer;transition:background .15s,border-color .15s}
.excl-banner:hover{background:var(--warn-bg);border-color:var(--warn);filter:brightness(0.98)}
.excl-banner strong{color:var(--warn)}
.cust-row.is-target{background:var(--accent-bg);border:1px solid var(--accent-border)}
.cust-row.is-target input{opacity:.5;cursor:not-allowed}
.rank-tbl tr.target td{background:var(--accent-bg);color:var(--text-strong);font-weight:600}
.rank-tbl tr.target td:first-child{border-left:3px solid var(--accent);padding-left:9px}
.rank-tbl td .rank-bar{display:inline-block;height:6px;border-radius:3px;background:var(--ok);vertical-align:middle;margin-left:6px;min-width:1px;max-width:120px}
.rank-tbl td .rank-bar.up{background:var(--crit)}
.act-badge{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 10px;border-radius:var(--radius-pill);background:var(--bg-card-alt);border:1px solid var(--border);color:var(--text-faint)}
.act-NEW{background:var(--accent-bg);border-color:var(--accent-border);color:var(--accent)}
.act-DIED,.act-INACTIVE{background:var(--bg-card-alt);border-color:var(--text-meta);color:var(--text-ghost);text-decoration:line-through}
.act-GREW{background:var(--crit-bg);border-color:var(--crit-border);color:var(--crit)}
.act-SHRANK{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok)}
.act-STABLE{color:var(--text-dim)}
.cred-card{display:grid;grid-template-columns:1fr 1.4fr;gap:18px 26px;background:var(--bg-card);border:1px solid var(--border);border-top:var(--accent-bar);border-radius:var(--radius);padding:20px 24px;margin-bottom:var(--gap-cards);box-shadow:var(--shadow-card)}
.cred-card.cred-hi{border-color:var(--ok-border);background:linear-gradient(135deg,var(--ok-bg),var(--bg-card))}
.cred-card.cred-mid{border-color:var(--warn-border);background:linear-gradient(135deg,var(--warn-bg),var(--bg-card))}
.cred-card.cred-lo{border-color:var(--crit-border);background:linear-gradient(135deg,var(--crit-bg),var(--bg-card))}
.cred-meter-lbl{font-size:10.5px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px;display:flex;align-items:center;gap:4px}
.cred-meter-bar{position:relative;height:8px;background:var(--bg-card-alt);border-radius:4px;overflow:hidden;margin-bottom:8px}
.cred-meter-fill{height:100%;background:linear-gradient(90deg,var(--crit) 0%,var(--warn) 50%,var(--ok) 100%);transition:width .3s}
.cred-meter-num{font-size:26px;font-weight:800;color:var(--text-strong);line-height:1}
.cred-reasons{font-size:11.5px;color:var(--text-muted);line-height:1.6;display:flex;flex-direction:column;gap:4px;align-self:center}
.cred-reason::before{content:'• ';color:var(--text-faint)}
.cred-plan{grid-column:1 / -1;font-size:12px;color:var(--crit-text);background:var(--crit-bg);border:1px solid var(--crit-border);padding:8px 12px;border-radius:var(--radius-sm);line-height:1.55}
@media (max-width: 760px){.cred-card{grid-template-columns:1fr}}
.paired-card{background:var(--bg-card);border:1px solid var(--border);border-top:var(--accent-bar);border-radius:var(--radius);padding:20px 24px;margin-bottom:var(--gap-cards);box-shadow:var(--shadow-card)}
.paired-head{font-size:12px;color:var(--text-muted);margin-bottom:11px}
.paired-head strong{color:var(--text-strong)}
.paired-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.paired-lbl{font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.paired-val{font-size:20px;font-weight:800;line-height:1}
.paired-sub{font-size:11px;color:var(--text-faint);margin-top:3px}
.paired-foot{font-size:11.5px;color:var(--text-muted);margin-top:11px;padding-top:9px;border-top:1px dashed var(--border-faint);line-height:1.55}
@media (max-width: 760px){.paired-grid{grid-template-columns:1fr}}
.dead-badge{display:inline-block;font-size:10px;font-weight:700;padding:3px 9px;border-radius:var(--radius-pill);background:var(--bg-card-alt);border:1px dashed var(--text-ghost);color:var(--text-ghost);text-transform:uppercase;margin-left:8px}
.burst-pill{display:inline-block;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:var(--radius-pill);background:var(--warn-bg);border:1px solid var(--warn-border);color:var(--warn);margin-left:8px}
.burst-pill.lo{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok)}
.burst-pill.hi{background:var(--crit-bg);border-color:var(--crit-border);color:var(--crit)}
.interp{background:var(--interp-bg);border:1px solid var(--accent-border);border-radius:var(--radius-sm);padding:14px 16px;margin-bottom:14px}
.interp-t{font-size:10.5px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}
.interp-item{font-size:12px;color:var(--text-muted);line-height:1.65;margin-bottom:6px;padding-left:3px}
.interp-item strong{color:var(--text-strong)}
.cur-status{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:var(--gap-row);margin-bottom:var(--sec-gap)}
.cur-stat{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 16px}
.cur-stat-t{font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px}
.cur-stat-v{font-size:20px;font-weight:800;line-height:1;margin-bottom:5px;letter-spacing:-.02em}
.cur-stat-s{font-size:11px;color:var(--text-faint);line-height:1.55}

.site-picker{display:flex;flex-wrap:wrap;gap:8px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:var(--gap-cards);max-height:108px;overflow-y:auto}
.sp-item{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--radius-pill);font-size:11.5px;cursor:pointer;border:1px solid var(--border);background:var(--bg-card-alt);color:var(--text-faint);user-select:none;transition:all .15s}
.sp-item:hover{color:var(--text-muted);border-color:var(--border-strong)}
.sp-item.on{border-color:var(--accent-border);color:var(--accent);background:var(--accent-bg)}
.sp-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.bench-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:var(--gap-row);margin-top:var(--gap-cards)}
.bench-item{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px 18px}
.bench-lbl{font-size:10px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.05em;margin-bottom:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-bottom:8px;border-bottom:1px solid var(--border-faint)}
.bench-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;gap:10px}
.bench-row:last-child{margin-bottom:0}
.bench-key{font-size:11px;color:var(--text-faint)} .bench-val{font-size:12px;font-weight:700;color:var(--text-dim)}
.bench-val.now{color:var(--accent);font-size:14px}
.summbox{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px 24px;font-family:ui-monospace,monospace;font-size:11.5px;line-height:1.9;color:var(--text-dim);white-space:pre;overflow-x:auto;margin-top:12px}
.ticon{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;background:var(--accent-bg);color:var(--accent);font-size:11px;font-weight:700;cursor:help;flex-shrink:0;transition:all .15s;line-height:1;border:1px solid var(--accent-border);vertical-align:middle}
.ticon:hover{background:var(--accent);color:#fff;border-color:var(--accent);transform:scale(1.08)}
.ticon:hover{background:var(--accent-bg);color:var(--accent);border-color:var(--accent-border)}
#sgd-tt{position:fixed;z-index:2147483648;max-width:360px;background:var(--tooltip-bg);border:1px solid var(--tooltip-border);border-radius:var(--radius);padding:16px 18px;font-size:12.5px;line-height:1.65;color:var(--tooltip-text);pointer-events:none;box-shadow:var(--shadow);display:none;opacity:0;transform:translateY(-4px);transition:opacity .12s,transform .12s}
#sgd-tt em{color:var(--tooltip-text);opacity:.8;font-style:italic}
#sgd-tt code{background:rgba(255,255,255,.1);padding:1px 6px;border-radius:4px;font-family:ui-monospace,monospace;font-size:11px}
#sgd-tt.vis{display:block;opacity:1;transform:translateY(0)} #sgd-tt strong{color:#FFFFFF;font-weight:700}
#sgd-tt.pinned{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-bg),var(--shadow)}
#sgd-tt.pinned::after{content:'press Esc to close';display:block;font-size:10px;color:rgba(255,255,255,.6);margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.15);text-align:center;letter-spacing:.04em}
#sgd-tt::before{content:'';position:absolute;width:0;height:0;border:6px solid transparent}
#sgd-tt[data-pos="below"]::before{top:-12px;left:24px;border-bottom-color:var(--tooltip-border)}
#sgd-tt[data-pos="above"]::before{bottom:-12px;left:24px;border-top-color:var(--tooltip-border)}
#sgd-tt[data-pos="left"]::before{right:-12px;top:24px;border-left-color:var(--tooltip-border)}
#sgd-tt[data-pos="right"]::before{left:-12px;top:24px;border-right-color:var(--tooltip-border)}
#sgd-tt h5,#sgd-tt strong:first-child{color:var(--text-strong);font-size:13.5px;font-weight:700;display:inline-block;margin-bottom:2px}
.inc-badge{font-size:9.5px;font-weight:700;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-border);border-radius:4px;padding:2px 5px;margin-left:4px}
svg.spark{display:inline-block;vertical-align:middle}
#sgd.waiting{background:transparent;pointer-events:none}
#sgd.waiting .sgd-hdr,#sgd.waiting .sgd-tabs,#sgd.waiting .sgd-body{display:none}
.sgd-wait{pointer-events:auto;position:fixed;bottom:20px;right:20px;width:420px;max-width:calc(100vw - 40px);background:var(--bg-card);border:1px solid var(--accent-border);border-top:3px solid var(--accent);border-radius:var(--radius);padding:18px 20px;box-shadow:var(--shadow);z-index:2147483647;max-height:calc(100vh - 40px);overflow-y:auto;font-family:'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif;color:var(--text)}
.sgd-wait *{box-sizing:border-box}
.sgd-wait h3{font-size:15px;font-weight:700;color:var(--text-strong);margin-bottom:7px}
.sgd-wait p{font-size:12px;color:var(--text-muted);line-height:1.6;margin-bottom:10px}
.sgd-wait-progress{font-size:12px;color:var(--text);margin:7px 0 5px;font-weight:600}
.sgd-wait-progress b{color:var(--ok)}
.sgd-wait-grp{margin-top:9px;background:var(--bg-card-alt);border:1px solid var(--border);border-radius:8px;padding:9px 11px}
.sgd-wait-grp-t{font-size:11.5px;font-weight:700;color:var(--text);margin-bottom:6px;display:flex;align-items:center;gap:6px}
.sgd-wait-grp-t .badge-need{font-size:9.5px;font-weight:700;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-border);border-radius:4px;padding:2px 6px;margin-left:auto}
.sgd-wait-grp-t .badge-done{background:var(--ok-bg);color:var(--ok);border-color:var(--ok-border)}
.sgd-wait-items{display:flex;flex-wrap:wrap;gap:6px}
.sgd-wait-item{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--radius-pill);font-size:11px;font-weight:600;background:var(--bg);border:1px solid var(--border);color:var(--text-faint);transition:all .3s}
.sgd-wait-item.on{background:var(--ok-bg);border-color:var(--ok-border);color:var(--ok)}
.sgd-wait-item .ck{width:13px;height:13px;border-radius:50%;background:var(--bg-card-alt);display:inline-flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;color:var(--text-faint)}
.sgd-wait-item.on .ck{background:var(--ok);color:var(--bg-card)}
.sgd-wait-acts{display:flex;gap:8px;margin-top:13px;padding-top:11px;border-top:1px solid var(--border)}
.sgd-wait-acts .btn{flex:1;padding:9px 14px;font-size:12.5px}
.sgd-wait-acts .btn.dim{opacity:.55;cursor:not-allowed;background:var(--bg-card-alt);color:var(--text-faint)}
.sgd-wait-acts .btn-pulse{background:#15803d;color:#fff;animation:sgd-glow 1.6s ease-in-out infinite}
@keyframes sgd-glow{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,0.6)}50%{box-shadow:0 0 0 8px rgba(52,211,153,0)}}
.dp{display:inline-block;width:7px;height:7px;border-radius:50%;background:#60a5fa;margin-right:5px;animation:sgdp 1.4s infinite}
@keyframes sgdp{0%,100%{opacity:1}50%{opacity:.2}}
.gspark{margin-top:12px;line-height:0;padding-top:10px;border-top:1px dashed var(--border-faint)}
.gspark svg{display:block;margin:0 auto;opacity:.9}
.gspark-lbl{font-size:10px;color:var(--text-faint);letter-spacing:.04em;text-transform:uppercase;margin-top:7px;line-height:1.5}
.score-parts{display:inline-flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.score-part{font-size:11px;color:var(--text-muted);background:var(--bg-card-alt);border:1px solid var(--border);border-radius:7px;padding:6px 11px}
.score-part b{color:var(--text-strong);font-weight:700;margin-left:3px}
.comp-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px}
.comp-list{display:flex;flex-direction:column;gap:7px;margin-top:14px;font-size:12px}
.comp-row{display:flex;align-items:center;gap:10px;color:var(--text-muted);padding:5px 0}
.comp-row .dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.comp-row .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.comp-row .v{font-variant-numeric:tabular-nums;color:var(--text-strong);font-weight:600}
.drillrow{cursor:pointer;transition:background .12s}
.drillrow:hover td{background:var(--accent-bg)}
.drillrow.sev1 td{background:var(--warn-bg)}
.drillrow.sev2 td{background:var(--crit-bg)}
.drillrow.sev3 td{background:var(--crit-bg);font-weight:600}
.drill-overlay{position:fixed;inset:0;background:rgba(3,7,18,0.85);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:26px}
.drill-modal{background:var(--bg-card);border:1px solid var(--accent-border);border-radius:var(--radius);width:min(980px,100%);max-height:88vh;overflow-y:auto;padding:28px 32px;box-shadow:0 24px 80px rgba(0,0,0,0.55)}
.drill-hdr{display:flex;align-items:center;gap:14px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.drill-hdr h3{font-size:16px;font-weight:700;color:var(--text-strong);flex:1;font-family:ui-monospace,monospace}
.drill-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:9px;margin-bottom:13px}
.drill-stat{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 11px}
.drill-stat .t{font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
.drill-stat .v{font-size:16px;font-weight:800;line-height:1;color:var(--text-strong)}
.drill-stat .s{font-size:10px;color:var(--text-faint);margin-top:3px}
.cust-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:7px 9px;border-radius:var(--radius-sm);cursor:pointer;font-size:11.5px;transition:background .12s}
.cust-row:hover{background:var(--bg-card-alt)}
.cust-row input{cursor:pointer;accent-color:var(--accent)}
.cust-row .cust-nm{color:var(--text-strong);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cust-row .cust-cpu{color:var(--text-faint);font-variant-numeric:tabular-nums;font-size:10.5px}
`;

    // ── SVG COMPONENTS ───────────────────────────────────────────────────────
    // Semi-circular gauge: arc from left(180°) to right(0°) curving upward.
    // Arc direction: clockwise (sweep=1). Zone guides behind value arc.
    const svgGauge = ({value, max, label, unit='', decimals=1, tipKey='', subtitle=''}) => {
        const fv = isFinite(+value) ? +value : 0;
        const fm = isFinite(+max) && +max > 0 ? +max : 100;
        const p = Math.min(0.999, Math.max(0.001, fv / fm));
        const cx = 80
          , cy = 72
          , r = 58
          , sw = 10;
        // vA: angle from positive x-axis (π→0 as p:0→1)
        const vA = Math.PI * (1 - p);
        const vx = (cx + r * Math.cos(vA)).toFixed(2);
        const vy = (cy - r * Math.sin(vA)).toFixed(2);
        // negative sin: SVG y-flip
        const col = p < 0.5 ? '#4ade80' : p < 0.75 ? '#FFC20E' : '#f87171';
        // Zone split points (50% = top, 75% = upper-right)
        const tx = cx
          , ty = cy - r;
        // 50% point: (80, 14)
        const z2x = (cx + r * Math.cos(Math.PI * 0.25)).toFixed(2);
        // 75%
        const z2y = (cy - r * Math.sin(Math.PI * 0.25)).toFixed(2);
        const td = tipKey ? ` data-tip="${esc(TIPS[tipKey] || '')}"` : '';
        // Background: two 90° arcs to avoid degenerate 180° arc
        const bg = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${tx} ${ty} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="#060d1a" stroke-width="${sw + 3}"/>`;
        // Zone guides (dim colored tracks; value arc overlays them)
        const zg = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${tx} ${ty}" fill="none" stroke="#4ade80" stroke-width="${sw}" opacity="0.17"/>`;
        const zy = `<path d="M${tx} ${ty} A${r} ${r} 0 0 1 ${z2x} ${z2y}" fill="none" stroke="#fbbf24" stroke-width="${sw}" opacity="0.17"/>`;
        const zr = `<path d="M${z2x} ${z2y} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="#f87171" stroke-width="${sw}" opacity="0.17"/>`;
        // Value arc (opaque, clockwise short path always < 180° since p ≤ 0.999)
        const va = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${vx} ${vy}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`;
        const dot = `<circle cx="${vx}" cy="${vy}" r="5" fill="${col}" stroke="#080e1e" stroke-width="2"/>`;
        return `<div class="gw"${td}><svg viewBox="0 0 160 90" width="160" height="90" style="display:block">
    ${bg}${zg}${zy}${zr}${va}${dot}
    <text x="${cx}" y="${cy + 3}" text-anchor="middle" fill="#f0f6ff" font-size="19" font-weight="800" font-family="-apple-system,system-ui,sans-serif">${fmtD(fv, decimals)}${esc(unit)}</text>
    ${subtitle ? `<text x="${cx}" y="${cy + 17}" text-anchor="middle" fill="#475569" font-size="9" font-family="-apple-system,system-ui,sans-serif">${esc(subtitle)}</text>` : ''}
    <text x="${cx}" y="11" text-anchor="middle" fill="#334155" font-size="9.5" font-family="-apple-system,system-ui,sans-serif" font-weight="600">${esc(label)}</text>
  </svg></div>`;
    }
    ;

    const svgSpark = (vals, color, w=80, h=22) => {
        if (!vals?.length)
            return '';
        const mx = Math.max(...vals, 1);
        const pts = vals.map( (v, i) => `${((i / Math.max(vals.length - 1, 1)) * w).toFixed(1)},${(h - (v / mx) * (h - 2) - 1).toFixed(1)}`).join(' ');
        return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
    }
    ;

    const svgBar = (value, max, color='#27AAE1', w=80, h=7) => {
        const p = Math.min(1, Math.max(0, (value / max) || 0));
        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${h / 2}" fill="#1a2744"/><rect x="0" y="0" width="${(p * w).toFixed(1)}" height="${h}" rx="${h / 2}" fill="${color}"/></svg>`;
    }
    ;
    // Stacked horizontal bar — segments are {label, value, color}. Renders proportional widths and label hover via title attrs.
    const svgStacked = (segments, w=600, h=24) => {
        const total = segments.reduce( (s, x) => s + (x.value || 0), 0);
        if (total <= 0)
            return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${h / 2}" fill="#1a2744"/></svg>`;
        let x = 0;
        const rects = segments.map(seg => {
            const sw = (seg.value / total) * w;
            const r = `<rect x="${x.toFixed(2)}" y="0" width="${sw.toFixed(2)}" height="${h}" fill="${seg.color}"><title>${esc(seg.label)} — ${fmtD((seg.value / total) * 100, 1)}% (${fmtN(seg.value)})</title></rect>`;
            x += sw;
            return r;
        }
        ).join('');
        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><clipPath id="sgd-stk-clip"><rect x="0" y="0" width="${w}" height="${h}" rx="${h / 2}"/></clipPath><g clip-path="url(#sgd-stk-clip)"><rect x="0" y="0" width="${w}" height="${h}" fill="#1a2744"/>${rects}</g></svg>`;
    }
    ;

    // ── DOM ───────────────────────────────────────────────────────────────────
    const setupRoot = () => {
        document.getElementById('sgd')?.remove();
        document.getElementById('sgd-css')?.remove();
        document.getElementById('sgd-tt')?.remove();
        const st = document.createElement('style');
        st.id = 'sgd-css';
        st.textContent = CSS;
        document.head.appendChild(st);
        const tt = document.createElement('div');
        tt.id = 'sgd-tt';
        tt.setAttribute('data-theme', S.ui.theme);
        document.body.appendChild(tt);
        const root = document.createElement('div');
        root.id = 'sgd';
        root.setAttribute('data-theme', S.ui.theme);
        if (!S.ui.explain)
            root.classList.add('explain-off');
        root.innerHTML = `
    <div class="sgd-hdr">
      <div class="sgd-hdr-inner">
        <a class="sgd-brand" href="https://www.cobblestonelearning.com" target="_blank" rel="noopener" title="Cobblestone Learning — Learning. Creativity. Trust.">
          <img src="${CBL_LOGO}" alt="Cobblestone Learning">
        </a>
        <div class="sgd-brand-titles">
          <h1>SiteGround Reports</h1>
          <div class="sgd-brand-tag">Learning. Creativity. Trust.</div>
        </div>
        <div class="sgd-hdr-sub" id="sgd-acct">Loading…</div>
        <div class="avail-bar" id="sgd-avail"></div>
        <div class="sgd-hdr-acts">
          <button class="excl-chip ${S.ui.excludedSites.size ? 'has' : ''}" id="sgd-excl-chip" data-tip="${esc('<strong>Manage site exclusions</strong> — click to open the include/exclude panel and toggle any site in or out of every per-site calculation (control group, network, ranking, DiD). Server-wide metrics (cores in use, GB used, live barometers) are unaffected — SiteGround\'s API does not report those per-site.')}">🚫 <span id="sgd-excl-count">${S.ui.excludedSites.size}</span> excluded</button>
          <button class="theme-toggle ${S.ui.explain ? 'on' : ''}" id="sgd-explain-toggle" data-tip="${esc('<strong>Explain mode</strong> — when on, every section gets a plain-English subtitle. Tooltips still work on hover for the technical detail.')}" title="Toggle plain-English explanations">📖</button>
          <button class="theme-toggle" id="sgd-theme-toggle" title="Toggle light/dark mode">${S.ui.theme === 'light' ? '🌙' : '☀️'}</button>
          <button class="btn sm" data-a="gen-report-current" data-tip="${esc('Open a Cobblestone-branded, print-ready document for the current tab. Health → Server Health Snapshot; Sites → Sites Overview; Before/After → DiD Analysis. Use your browser\'s "Save as PDF" from the print dialog.')}" style="background:var(--accent);color:#fff;border-color:var(--accent)">📄 Report</button>
          <button class="btn sec sm" data-a="export">Export CSV</button>
          <button class="btn sec sm" data-a="copy">Copy Summary</button>
          <button class="btn sec sm" data-a="dl-raw" title="Download every raw SiteGround API payload this dashboard captured, as a single JSON bundle">⬇ Raw API</button>
          <button class="btn danger sm" data-a="close">✕</button>
        </div>
      </div>
    </div>
    <nav class="sgd-tabs">
      <div class="sgd-tabs-inner">
        <button class="sgd-tab on" data-tab="health">⚡ Health</button>
        <button class="sgd-tab" data-tab="sites">🌐 Sites</button>
        <button class="sgd-tab" data-tab="compare">🔬 Before/After</button>
        <button class="sgd-tab" data-tab="trends">📈 Trends</button>
        <button class="sgd-tab" data-tab="raw">📋 Raw</button>
        <button class="sgd-tab" data-tab="guide">📘 Guide</button>
      </div>
    </nav>
    <div class="sgd-body" id="sgd-body"><div class="sbar" id="sgd-st">Initialising…</div></div>`;
        document.body.appendChild(root);
        return root;
    }
    ;

    const setSt = (msg, cls='') => {
        const el = document.getElementById('sgd-st');
        if (!el)
            return;
        el.className = `sbar ${cls}`;
        el.innerHTML = msg;
    }
    ;
    const setAcct = () => {
        const el = document.getElementById('sgd-acct');
        if (!el)
            return;
        const d = S.data;
        el.textContent = d ? `${d.dates.length} days · ${d.siteStats.filter(s => s.total > 0).length} active · ${fmtN(d.acctTotal)} CPU sec total` : 'Waiting…';
    }
    ;
    const AVAIL = [{
        k: 'sec_daily',
        l: 'CPU/Day'
    }, {
        k: 'sec_hourly',
        l: 'CPU/Hr'
    }, {
        k: 'exec_daily',
        l: 'Exec/Day'
    }, {
        k: 'exec_hourly',
        l: 'Exec/Hr'
    }, {
        k: 'core_daily',
        l: 'Core/Day'
    }, {
        k: 'core_hourly',
        l: 'Core/Hr'
    }, {
        k: 'core_3min',
        l: 'Core/3m'
    }, {
        k: 'mem_daily',
        l: 'Mem/Day'
    }, {
        k: 'mem_hourly',
        l: 'Mem/Hr'
    }, {
        k: 'mem_3min',
        l: 'Mem/3m'
    }];
    const updateAvailUI = () => {
        const html = AVAIL.map(s => `<span class="av-b ${CAP[s.k] ? 'on' : ''}"><span class="dot"></span>${s.l}</span>`).join('');
        ['sgd-avail', 'sgd-avail-wait'].forEach(id => {
            const el = document.getElementById(id);
            if (el)
                el.innerHTML = html;
        }
        );
        // If the wait panel is open, refresh its grouped checklist + button state too.
        if (typeof refreshWaitPanel === 'function')
            refreshWaitPanel();
    }
    ;

    // ── TOOLTIPS ──────────────────────────────────────────────────────────────
    // Anchors to the element (not cursor), picks the side with the most room, adds a CSS arrow.
    // Hover shows transient; click on the trigger pins it open until next click or Esc.
    // Lazy-creates the popup element so it works even if the original was removed somehow.
    const getOrCreateTooltip = () => {
        let tt = document.getElementById('sgd-tt');
        if (!tt) {
            tt = document.createElement('div');
            tt.id = 'sgd-tt';
            tt.setAttribute('data-theme', S.ui.theme || 'light');
            document.body.appendChild(tt);
        }
        return tt;
    }
    ;
    const initTooltips = root => {
        const place = el => {
            const tt = getOrCreateTooltip();
            const r = el.getBoundingClientRect();
            tt.style.left = '-9999px';
            tt.style.top = '-9999px';
            tt.classList.add('vis');
            const tw = tt.offsetWidth
              , th = tt.offsetHeight;
            const vw = window.innerWidth
              , vh = window.innerHeight;
            const pad = 12;
            const spaceBelow = vh - r.bottom
              , spaceAbove = r.top;
            const spaceRight = vw - r.right
              , spaceLeft = r.left;
            let pos = 'below'
              , left, top;
            if (spaceBelow >= th + pad + 8) {
                pos = 'below';
                top = r.bottom + 10;
                left = Math.max(pad, Math.min(vw - tw - pad, r.left - 12));
            } else if (spaceAbove >= th + pad + 8) {
                pos = 'above';
                top = r.top - th - 10;
                left = Math.max(pad, Math.min(vw - tw - pad, r.left - 12));
            } else if (spaceRight >= tw + pad + 8) {
                pos = 'right';
                left = r.right + 10;
                top = Math.max(pad, Math.min(vh - th - pad, r.top - 12));
            } else if (spaceLeft >= tw + pad + 8) {
                pos = 'left';
                left = r.left - tw - 10;
                top = Math.max(pad, Math.min(vh - th - pad, r.top - 12));
            } else {
                pos = 'below';
                left = Math.max(pad, (vw - tw) / 2);
                top = Math.max(pad, (vh - th) / 2);
            }
            tt.dataset.pos = pos;
            tt.style.left = left + 'px';
            tt.style.top = top + 'px';
        }
        ;
        const show = el => {
            const tt = getOrCreateTooltip();
            tt.innerHTML = el.dataset.tip || '';
            if (!tt.innerHTML)
                return;
            place(el);
            S.ui.ttCurrent = el;
        }
        ;
        const hide = () => {
            const tt = document.getElementById('sgd-tt');
            if (!tt)
                return;
            tt.classList.remove('vis');
            tt.classList.remove('pinned');
            S.ui.ttCurrent = null;
            S.ui.ttPinned = false;
        }
        ;
        // Hover handler — show transient, don't override a pinned tooltip.
        root.addEventListener('mouseover', e => {
            if (S.ui.ttPinned)
                return;
            const el = e.target.closest('[data-tip]');
            if (!el || !el.dataset.tip || el === S.ui.ttCurrent)
                return;
            show(el);
        }
        );
        root.addEventListener('mouseout', e => {
            if (S.ui.ttPinned)
                return;
            const el = e.target.closest('[data-tip]');
            if (!el)
                return;
            if (e.relatedTarget && el.contains(e.relatedTarget))
                return;
            hide();
        }
        );
        // Click-to-pin — but ONLY for the dedicated help icons (.ticon) and table headers,
        // which are purely informational. Action buttons, the explain/theme toggles, the
        // exclude chip, tabs, cards, etc. ALSO carry data-tip; pinning those (and the
        // e.stopPropagation it required) used to swallow the click in this capture-phase
        // listener so the button's real action — handled in the bubble-phase handler — never
        // fired. Restricting the pin to .ticon/<th> lets every actionable control work while
        // still giving the help icons their click-to-pin behaviour. Hover still shows the
        // tooltip for everything with data-tip (see the mouseover handler above).
        root.addEventListener('click', e => {
            const el = e.target.closest('[data-tip]');
            const pinnable = el && el.dataset.tip && (el.classList.contains('ticon') || el.tagName === 'TH');
            if (pinnable) {
                if (S.ui.ttCurrent === el && S.ui.ttPinned) {
                    hide();
                } else {
                    show(el);
                    S.ui.ttPinned = true;
                    document.getElementById('sgd-tt')?.classList.add('pinned');
                }
                e.stopPropagation();
                return;
            }
            // Any other click (including on action buttons that happen to carry a tooltip):
            // dismiss a pinned tooltip but DO NOT stop propagation — the action must run.
            if (S.ui.ttPinned)
                hide();
        }
        , true);
        // Esc dismisses pinned tooltip.
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && S.ui.ttPinned)
                hide();
        }
        );
        // Re-position on scroll while open (hover or pinned).
        window.addEventListener('scroll', () => S.ui.ttCurrent && place(S.ui.ttCurrent), {
            passive: true
        });
        window.addEventListener('resize', () => S.ui.ttCurrent && place(S.ui.ttCurrent));
    }
    ;

    // ── ECHARTS ───────────────────────────────────────────────────────────────
    const ckill = id => {
        if (S.ui.charts[id]) {
            try {
                S.ui.charts[id].dispose();
            } catch {}
            delete S.ui.charts[id];
        }
    }
    ;
    const cinit = (id, opt) => {
        ckill(id);
        const el = document.getElementById(id);
        if (!el || !window.echarts)
            return;
        const c = window.echarts.init(el, null, {
            renderer: 'canvas',
            backgroundColor: 'transparent'
        });
        c.setOption(opt);
        S.ui.charts[id] = c;
        new ResizeObserver( () => c.resize()).observe(el);
        return c;
    }
    ;

    // Build a fresh BASE option each time we init a chart, so theme colors come from
    // the *current* CSS variables (i.e. light vs dark mode is honoured live).
    const baseChartOpts = () => {
        const tc = themeChartColors();
        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 300,
            grid: {
                left: 64,
                right: 64,
                top: 30,
                bottom: 62
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: tc.tipBg,
                borderColor: tc.axis,
                textStyle: {
                    color: tc.tipText,
                    fontSize: 11.5
                },
                extraCssText: 'border-radius:9px;padding:10px 13px;box-shadow:0 8px 30px rgba(0,0,0,0.4)'
            },
            legend: {
                type: 'scroll',
                bottom: 2,
                left: 'center',
                textStyle: {
                    color: tc.text,
                    fontSize: 10.5
                },
                pageTextStyle: {
                    color: tc.text
                },
                inactiveColor: tc.axis
            },
            xAxis: {
                type: 'category',
                axisLine: {
                    lineStyle: {
                        color: tc.axis
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: tc.text,
                    fontSize: 10.5,
                    rotate: 30
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: tc.text,
                    fontSize: 10.5
                },
                splitLine: {
                    lineStyle: {
                        color: tc.grid
                    }
                }
            },
            dataZoom: [{
                type: 'slider',
                bottom: 24,
                height: 16,
                fillerColor: 'rgba(39,170,225,0.1)',
                borderColor: tc.axis,
                textStyle: {
                    color: tc.text,
                    fontSize: 9
                }
            }, {
                type: 'inside',
                zoomOnMouseWheel: 'shift',
                moveOnMouseWheel: false,
                moveOnMouseMove: true,
                preventDefaultMouseMove: false
            }],
        };
    }
    ;
    // Lazy proxy: existing chart code uses both BASE.foo AND {...BASE, ...} — proxy with full traps
    // so the spread operator sees the live keys + values from the current theme.
    const BASE = new Proxy({}, {
        get(_, prop) {
            return baseChartOpts()[prop];
        },
        has(_, prop) {
            return prop in baseChartOpts();
        },
        ownKeys() {
            return Reflect.ownKeys(baseChartOpts());
        },
        getOwnPropertyDescriptor(_, prop) {
            const o = baseChartOpts();
            if (!(prop in o))
                return undefined;
            return {
                configurable: true,
                enumerable: true,
                writable: true,
                value: o[prop]
            };
        }
    });
    const mkY = (name, extra={}) => ({
        ...BASE.yAxis,
        name,
        nameTextStyle: {
            color: themeChartColors().text,
            fontSize: 9.5
        },
        ...extra
    });
    const mkLn = (name, data, color, extra={}) => ({
        name,
        type: 'line',
        data,
        lineStyle: {
            color,
            width: 2
        },
        itemStyle: {
            color
        },
        symbol: 'circle',
        symbolSize: 4,
        ...extra
    });
    const mkBar = (name, data, color, extra={}) => ({
        name,
        type: 'bar',
        stack: 's',
        data,
        itemStyle: {
            color
        },
        ...extra
    });
    const benchMark = (vals, color) => {
        const a = avgAll(vals.filter(v => v > 0));
        if (!a)
            return undefined;
        const c = color || themeChartColors().text;
        return {
            silent: true,
            lineStyle: {
                color: c,
                type: 'dashed',
                width: 1
            },
            data: [{
                yAxis: a
            }],
            label: {
                formatter: '30d avg',
                color: c,
                fontSize: 9.5,
                position: 'end'
            }
        };
    }
    ;

    // Vertical markers on a date-axis chart for every plan change (core or memory).
    // Returns an ECharts markLine config for a series whose xAxis is the date list.
    const planChangeMarkLine = (planChanges, opts={}) => {
        if (!planChanges || !planChanges.length)
            return undefined;
        return {
            silent: true,
            symbol: 'none',
            lineStyle: {
                color: '#a78bfa',
                type: 'dashed',
                width: 1.5,
                ...(opts.lineStyle || {})
            },
            label: {
                color: '#a78bfa',
                fontSize: 9.5,
                position: 'start',
                ...(opts.label || {})
            },
            data: planChanges.map(c => ({
                xAxis: c.date,
                label: {
                    formatter: `${c.kind === 'core' ? c.fromVal + '→' + c.toVal + 'c' : c.fromVal + '→' + c.toVal + 'GB'}`,
                    fontSize: 9
                }
            }))
        };
    }
    ;

    // ── SHARED CONTROLS ───────────────────────────────────────────────────────
    const groupCtrl = () => `<div class="fld"><label>Group</label><select id="sgd-group">${Object.entries(GROUP_DEFS).map( ([k,v]) => `<option value="${k}" ${S.ui.group === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>`;
    const stepToggle = () => {
        const avail = {
            daily: !!(CAP.sec_daily && CAP.core_daily),
            hourly: !!(CAP.sec_hourly && CAP.core_hourly),
            '3min': !!CAP.core_3min
        };
        const tips = {
            daily: 'Daily (Last Month) — auto-captured',
            hourly: '24hr hourly — auto-captured from page load',
            '3min': '30min at 15-sec — auto-captured from page load'
        };
        return `<div class="fld"><label>Resolution</label><div class="step-toggle">${[['daily', 'Day'], ['hourly', 'Hour'], ['3min', '3 Min']].map( ([k,l]) => `<button class="step-btn ${S.ui.viewStep === k ? 'on' : ''}" data-step="${k}" title="${tips[k]}" ${!avail[k] ? 'disabled' : ''}>${l}</button>`).join('')}</div></div>`;
    }
    ;
    const sitePicker = (sites, sel) => sites.map( (s, i) => `<span class="sp-item ${sel.has(s.domain) ? 'on' : ''}" data-sp="${esc(s.domain)}" title="${esc(s.domain)}"><span class="sp-dot" style="background:${CFG.palette[i % CFG.palette.length]}"></span>${esc(s.domain.split('.')[0])}</span>`).join('');

    // Intro card factory — each tab gets a tailored "what am I looking at" explanation.
    const introCard = (tab) => {
        const intros = {
            health: {
                ico: '⚡',
                title: 'Server health at a glance',
                body: 'This page tells you <strong>whether your server is in trouble right now and which site is driving it</strong>. Start with the score banner — if it\'s green, you\'re fine. The gauges show the live state of CPU, memory, and the 7-day trajectory. The 24-hour chart shows what happened today, hour by hour.',
                more: '<li><strong>Score 75+:</strong> healthy — no action needed.</li><li><strong>Score 45–74:</strong> elevated — check the alerts panel; usually one site is misbehaving.</li><li><strong>Score below 45:</strong> something is wrong right now — look at the Primary Suspect card and the alerts list first.</li><li><strong>CPU vs Memory:</strong> CPU spikes mean slow page loads. Memory near 85% means risk of out-of-memory crashes.</li><li><strong>Trajectory gauge:</strong> if "→ 75% in 4d" is showing, plan to investigate before the weekend.</li>'
            },
            sites: {
                ico: '🌐',
                title: 'Per-site usage and efficiency',
                body: 'Compare your sites side-by-side. The <strong>CPU / Execution</strong> bar chart is the most important — it shows the <em>cost of each request</em>, separating "lots of traffic" from "each request is heavy". Sortable table at the bottom has everything.',
                more: '<li><strong>Total CPU:</strong> total work the site did over 30 days.</li><li><strong>Avg/Day & 7d Avg:</strong> daily averages — use the 7d to see recent behaviour.</li><li><strong>Peak:</strong> the worst single day. If peak is &gt;10× average, the site is spiky and unstable.</li><li><strong>% Acct:</strong> what fraction of your whole account this site uses.</li><li><strong>CPU/Exec:</strong> the cost per PHP request. Below 1 sec/exec is great. Above 3 sec/exec means each request is expensive — usually plugins, queries, or SCORM saves.</li><li><strong>7d Trend:</strong> positive means CPU is climbing week-on-week, negative means improving.</li>'
            },
            compare: {
                ico: '🔬',
                title: 'Did your fix work? Prove it.',
                body: 'Pick a site, a fix date, and how many days to compare before/after. The dashboard uses a <strong>control group</strong> of other sites to rule out ambient traffic changes — if everyone got quieter, that\'s not your fix. The interpretation paragraph translates the numbers into a story you can show stakeholders.',
                more: '<li><strong>Target Share:</strong> the target\'s % of total account CPU. If this drops, your site became proportionally less dominant — regardless of overall traffic.</li><li><strong>Target / Control ratio:</strong> the gold-standard metric. If it falls significantly, your fix is the cause, not background noise.</li><li><strong>Welch\'s t-test p-value:</strong> statistical significance. p &lt; 0.05 means the change is unlikely to be coincidence.</li><li><strong>5–7 days of "after" data</strong> is recommended before declaring success. Earlier than that and one busy day can skew everything.</li>'
            },
            trends: {
                ico: '📈',
                title: 'Patterns over time',
                body: 'Switch between Day / Hour / 3-Min resolution to zoom into different timeframes. The <strong>day-of-week pattern</strong> reveals recurring traffic patterns (Monday spikes, weekend lulls). The <strong>trajectory line</strong> projects where you\'re heading if current trends continue.',
                more: '<li><strong>Daily view:</strong> 30-day picture. Look for week-on-week climb (bad) or step-changes after a fix (good).</li><li><strong>Hourly view:</strong> last 24h. Shows the day\'s rhythm and which hours were busy.</li><li><strong>3-Min view:</strong> live pressure at 15-second resolution. Use this when you think the server is currently struggling.</li><li><strong>Day-of-Week pattern:</strong> shows the average + peak CPU per weekday. Bars with much higher peak than average mean that day is unstable.</li>'
            },
            raw: {
                ico: '📋',
                title: 'Source data — every number, every day',
                body: 'A flat table of every daily metric per site. Use the <strong>Export CSV</strong> button to pull this into Excel or Google Sheets for deeper analysis. The Group dropdown changes which sites are shown as columns.',
                more: '<li><strong>Acct CPU:</strong> total account-wide CPU for the day.</li><li><strong>Cores Used:</strong> cores in use for the day (out of plan total). Red when over 75% of plan.</li><li><strong>Memory (GB):</strong> day\'s peak memory used. Red over 85% of plan.</li><li><strong>partial badge:</strong> today\'s data is still accumulating — excluded from averages and trends.</li>'
            }
        };
        const i = intros[tab];
        if (!i)
            return '';
        return `<div class="intro-card"><div class="ico">${i.ico}</div><div class="body"><h4>${esc(i.title)}</h4><div>${i.body}</div><details open><summary>How to read this in detail</summary><div class="more"><ul>${i.more}</ul></div></details></div></div>`;
    }
    ;

    // ── HEALTH TAB (v2) ───────────────────────────────────────────────────────
    // Layout objective: the first viewport answers "should I worry, and why?".
    // Vertical pacing: score → suspect (conditional) → 4 gauges with sparklines → 2 barometers
    //                  → alerts + composition (right now) → 24hr stacked share → snapshot table (drilldown)
    const renderHealth = data => {
        const body = document.getElementById('sgd-body');
        const liveCore = getLiveCore();
        const liveCores = getLiveCores();
        const limit = getCoreLimit();
        const liveMemGb = getLiveMemGb();
        const memLim = getMemLimit();
        const h = buildHourlyData();
        const alerts = buildAlerts(data, h);
        const {score, parts} = computeHealthScore(data, alerts);
        const lvl = score >= 75 ? 'ok' : score >= 45 ? 'warn' : 'crit';
        const lvlLabel = lvl === 'ok' ? 'Healthy' : lvl === 'warn' ? 'Elevated' : 'Under Pressure';
        const lvlDesc = lvl === 'ok' ? 'Server operating within normal parameters.' : lvl === 'warn' ? 'Some load pressure detected — monitor closely.' : 'Action required — investigate immediately.';
        const suspect = findPrimarySuspect(data, h);
        const avgHrAcct = data.benchmarks.acct.avg30 / 24;
        const curHrAcct = h ? lastCompleteHourly(h.secPts) : 0;
        // Sparkline data per gauge: short trail visible inside each gauge card.
        // Core spark in CORES (plan-immune); memory spark in GB.
        const coreSpark = data.dates.map(d => +(data.coresUsedMap.get(d) || 0)).slice(-14);
        const memSpark = data.hasMem ? data.dates.map(d => +(data.memDailyGbMap.get(d) || 0)).slice(-14) : [];
        const acctHrSpark = h ? h.secPts.slice(-24).map(p => +p.value || 0) : [];
        const projSpark = (() => {
            if (!data.coreProj?.reg)
                return [];
            // coreSpark is in cores; regression slope/intercept also in cores → projection in cores.
            const baseArr = coreSpark.slice();
            for (let i = 1; i <= 7; i++) {
                const x = data.coreProj.lastX + i;
                baseArr.push(+(data.coreProj.reg.slope * x + data.coreProj.reg.intercept).toFixed(3));
            }
            return baseArr;
        }
        )();
        // Pre-build the composition (right-now share) data once
        const composition = h ? h.sites
            .map(s => ({
                domain: s.domain,
                value: lastCompleteHourly(s.points)
            }))
            .filter(x => x.value > 0)
            .sort( (a, b) => b.value - a.value)
            .slice(0, 12)
            .map( (x, i) => ({
                label: x.domain,
                value: x.value,
                color: CFG.palette[i % CFG.palette.length]
            })) : [];
        const compTotal = composition.reduce( (s, x) => s + x.value, 0);
        body.innerHTML = `
    ${introCard('health')}
    <div class="hbanner ${lvl}" ${tipAttr('health_score')}>
      <div class="hb-icon">${lvl === 'ok' ? '🟢' : lvl === 'warn' ? '🟡' : '🔴'}</div>
      <div class="hb-score ${lvl}">${score}</div>
      <div class="hb-text">
        <h2>${lvlLabel}</h2>
        <p>${lvlDesc} ${score}/100 composite.</p>
        <div class="score-parts">
          <span class="score-part" title="Live cores in use vs plan limit">Capacity <b>${Math.round(parts.capacity)}</b>/40</span>
          <span class="score-part" title="Week-on-week direction">Trend <b>${Math.round(parts.trend)}</b>/20</span>
          <span class="score-part" title="Open warnings & criticals">Anomalies <b>${Math.round(parts.anomalies)}</b>/20</span>
          <span class="score-part" title="Live memory GB vs plan limit">Memory <b>${Math.round(parts.memory)}</b>/10</span>
          <span class="score-part" title="HHI — is one site dominating?">Concentration <b>${Math.round(parts.concentration)}</b>/10</span>
        </div>
      </div>
    </div>
    ${data.planChanges?.length ? `<div class="sbar info" style="margin-bottom:14px;background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)" ${tipAttr('plan_change')}>ℹ️ <strong>Plan upgraded:</strong> ${data.planChanges.map(c => `${c.kind === 'mem' ? 'memory' : 'cores'} ${c.fromVal}→${c.toVal}${c.kind === 'mem' ? 'GB' : ''} on <strong>${c.date}</strong>`).join('; ')}. All metrics on this dashboard are in <strong>absolute units</strong> (cores in use, GB used, CPU seconds) — plan-immune by construction, so the timeline is directly comparable. The purple marker is just a reference point. ${tipIcon('plan_change')}</div>` : ''}
    ${(() => {
        // Headroom strip: cores/GB available RIGHT NOW. Leads with the absolute number
        // (how fast we're going) — "% of plan" demoted to subtitle for capacity-planning.
        const coreFree = (liveCores !== null && limit) ? Math.max(0, limit - liveCores) : null;
        const liveCorePct = (liveCores !== null && limit) ? (liveCores / limit) * 100 : null;
        // Memory absolute GB headroom: parse from CAP.mem_3min/hourly limits_list if present
        const memLimGbRaw = (CAP.mem_3min?.data?.limits_list || CAP.mem_hourly?.data?.limits_list || CAP.mem_daily?.data?.limits_list || []);
        const memLimGbVal = memLimGbRaw.length ? +memLimGbRaw[memLimGbRaw.length - 1].value : null;
        const memCacheGb = (() => {
            const c = CAP.mem_3min?.data?.points_series?.points_cache || CAP.mem_hourly?.data?.points_series?.points_cache;
            return c?.length ? +c[c.length - 1].value : null;
        }
        )();
        const memCombinedGb = (liveMemGb !== null && memCacheGb !== null) ? liveMemGb + memCacheGb : liveMemGb;
        const memFreeGb = (memLimGbVal !== null && memCombinedGb !== null) ? Math.max(0, memLimGbVal - memCombinedGb) : null;
        const memCombinedPct = (memLimGbVal && memCombinedGb !== null) ? (memCombinedGb / memLimGbVal) * 100 : null;
        const cls = pct => pct === null ? 'cd' : pct > 75 ? 'cr' : pct > 50 ? 'cw2' : 'cg';
        return `<div class="net-hero" style="grid-template-columns:repeat(4,1fr);padding:14px 18px;margin-bottom:14px">
      <div class="nh-row"><div class="nh-lbl">${tipIcon('headroom')} Cores in Use</div>
        <div class="nh-big ${cls(liveCorePct)}">${liveCores !== null ? liveCores.toFixed(2) : '—'}<span style="font-size:14px;color:var(--text-faint);font-weight:600"> / ${limit} cores</span></div>
        <div class="nh-sub">${coreFree !== null ? `<strong>${coreFree.toFixed(2)} cores free</strong> · ${liveCorePct.toFixed(1)}% of plan` : 'awaiting live data'}</div>
      </div>
      <div class="nh-row"><div class="nh-lbl">${tipIcon('mem_combined')} Memory in Use (combined)</div>
        <div class="nh-big ${cls(memCombinedPct)}">${memCombinedGb !== null ? memCombinedGb.toFixed(2) : '—'}<span style="font-size:14px;color:var(--text-faint);font-weight:600"> / ${memLimGbVal ?? '—'} GB</span></div>
        <div class="nh-sub">${memCombinedPct !== null ? `<strong>${memFreeGb.toFixed(2)} GB free</strong> · ${memCombinedPct.toFixed(1)}% of plan${liveMemGb !== null && memCacheGb !== null ? ` (real ${liveMemGb.toFixed(2)} + cache ${memCacheGb.toFixed(2)})` : ''}` : 'awaiting live data'}</div>
      </div>
      <div class="nh-row"><div class="nh-lbl">${tipIcon('cpu_seconds')} Live Hourly CPU</div>
        <div class="nh-big cn">${fmtN(curHrAcct)}<span style="font-size:14px;color:var(--text-faint);font-weight:600"> CPU sec/hr</span></div>
        <div class="nh-sub">${avgHrAcct ? `vs 30d avg <strong>${fmtN(avgHrAcct)}</strong>/hr · <span class="${clsCh(((curHrAcct / avgHrAcct) - 1) * 100)}">${signStr(((curHrAcct / avgHrAcct) - 1) * 100)}</span>` : 'no hourly baseline'}</div>
      </div>
      <div class="nh-row"><div class="nh-lbl">${tipIcon('core_pct')} 7d Trajectory</div>
        <div class="nh-big ${data.coreProj?.reg ? (data.coreProj.reg.slope > 0.05 ? 'cr' : data.coreProj.reg.slope > 0 ? 'cw2' : 'cg') : 'cd'}">${data.coreProj?.reg ? `${data.coreProj.reg.slope > 0 ? '+' : ''}${data.coreProj.reg.slope.toFixed(3)}<span style="font-size:13px;font-weight:600"> cores/d</span>` : '—'}</div>
        <div class="nh-sub">${data.coreProj?.reg ? `→ ${(limit * 0.75).toFixed(2)} cores (75% of plan) in <strong>${data.coreProj.daysTo75 ? data.coreProj.daysTo75.toFixed(1) + 'd' : '—'}</strong>${data.coreProj.ci?.daysLo && data.coreProj.ci?.daysHi ? ` <span style="color:var(--text-faint)">(95% CI ${data.coreProj.ci.daysLo.toFixed(0)}–${data.coreProj.ci.daysHi.toFixed(0)}d)</span>` : ''} · r² ${data.coreProj.reg.r2.toFixed(2)} · n=${data.coreProj.sampleN}` : 'insufficient data for projection'}</div>
      </div>
    </div>`;
    }
    )()}
    ${(() => {
        // Peak-window service health — lead with the hour that actually matters to learners (busiest
        // execution hour), not the daily average. Headroom there is the real "can learners use it" read.
        if (!data.hasExec)
            return '';
        const am = buildActivityMatrix(null);
        if (!am || !am.peakHour)
            return '';
        const cm = buildCoreHourMatrix();
        const ph = am.peakHour.h;
        let headroom = null;
        if (cm && cm.limit) {
            const col = cm.avg.map(r => r[ph]).filter(v => v !== null);
            if (col.length)
                headroom = (1 - (col.reduce((s, v) => s + v, 0) / col.length) / cm.limit) * 100;
        }
        const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const when = am.weekdaysCovered >= 4 && am.peak ? `${DOW[am.peak.w]} ${String(am.peak.h).padStart(2, '0')}:00` : `${String(ph).padStart(2, '0')}:00`;
        const cls = headroom === null ? 'cd' : headroom < 15 ? 'cr' : headroom < 35 ? 'cw2' : 'cg';
        const verdict = headroom === null ? '' : headroom < 15 ? 'tight — learners likely feel it' : headroom < 35 ? 'getting tight at peak' : 'comfortable at peak';
        return `<div class="sbar" style="background:var(--accent-bg);border:1px solid var(--accent);border-left:3px solid var(--accent);color:var(--text);display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:14px">
      <span style="font-size:18px">🎓</span>
      <span>Busiest learning window <strong>${when}</strong> · ~<strong>${fmtN(am.peakHour.v)}</strong> requests/hr${headroom !== null ? ` · headroom there <strong class="${cls}">${headroom.toFixed(0)}%</strong> of the ${cm.limit}-core plan — <strong>${verdict}</strong>` : ''}.</span>
      <span style="color:var(--text-faint);font-size:11px;flex-basis:100%">This is the hour that actually matters to learners — not the daily average.${am.weekdaysCovered >= 4 ? '' : ' The weekday heatmap on Trends fills in as you revisit.'}</span>
    </div>`;
    }
    )()}
    ${suspect && suspect.score > 0 ? renderSuspectCard(suspect, liveCores, limit) : ''}
    <div class="gauges">
      <div class="gc" ${tipAttr('core_pct')}>
        ${svgGauge({
            value: liveCores !== null ? liveCores : 0,
            max: limit || 9,
            label: 'Cores in Use',
            unit: ` / ${limit}`,
            decimals: 2,
            subtitle: liveCores !== null && limit ? `${((liveCores / limit) * 100).toFixed(1)}% of plan` : '—'
        })}
        <div class="gspark">${svgSpark(coreSpark, '#94a3b8', 144, 22)}<div class="gspark-lbl">last 14d · 30d avg ${fmtD(data.benchmarks.core.avg30, 2)} cores</div></div>
      </div>
      <div class="gc" data-tip="${esc('<strong>Memory in Use</strong> — live RAM used (GB) of plan limit. OOM-kills surface here before they surface in CPU.')}">
        ${svgGauge({
            value: liveMemGb !== null ? liveMemGb : 0,
            max: memLim || 14,
            label: 'Memory in Use',
            unit: ` / ${memLim ?? '?'} GB`,
            decimals: 2,
            subtitle: liveMemGb !== null && memLim ? `${((liveMemGb / memLim) * 100).toFixed(1)}% of plan` : 'capture Mem/3m'
        })}
        <div class="gspark">${data.hasMem ? svgSpark(memSpark, '#a78bfa', 144, 22) + `<div class="gspark-lbl">last 14d · 30d peak-avg ${data.benchmarks.mem ? fmtD(data.benchmarks.mem.avg30, 2) + ' GB' : '—'}</div>` : '<div class="gspark-lbl" style="padding:14px 0">capture <strong>Memory → Last Month</strong> to enable</div>'}</div>
      </div>
      <div class="gc" ${tipAttr('cpu_seconds')}>
        ${svgGauge({
            value: curHrAcct,
            max: Math.max(curHrAcct * 1.6, avgHrAcct * 3, 1),
            label: 'Account CPU / hr',
            decimals: 0,
            subtitle: 'vs 30d hourly avg'
        })}
        <div class="gspark">${acctHrSpark.length ? svgSpark(acctHrSpark, '#27AAE1', 144, 22) + `<div class="gspark-lbl">last 24hr · avg ${fmtN(avgHrAcct)}/hr</div>` : '<div class="gspark-lbl" style="padding:14px 0">capture <strong>CPU → 24 Hours</strong> to enable</div>'}</div>
      </div>
      <div class="gc" data-tip="${esc('<strong>Trajectory</strong> — linear regression on the last 7 complete days of cores in use. Days-to-saturation projects when the trend crosses 75% of the plan limit (= ' + (limit * 0.75).toFixed(2) + ' cores). r² indicates fit confidence — closer to 1 = more reliable.')}">
        ${svgGauge({
            value: data.coreProj?.reg ? Math.max(0, Math.min(100, data.coreProj.daysTo75 ? Math.max(0, 100 - data.coreProj.daysTo75 * 7) : (data.coreProj.reg.slope <= 0 ? 0 : 10))) : 0,
            max: 100,
            label: 'Trend Risk',
            unit: '',
            decimals: 0,
            subtitle: data.coreProj?.reg ? `${data.coreProj.reg.slope > 0 ? '↗' : data.coreProj.reg.slope < 0 ? '↘' : '→'} ${data.coreProj.reg.slope > 0 ? '+' : ''}${data.coreProj.reg.slope.toFixed(3)} cores/d` : 'no trend'
        })}
        <div class="gspark">${projSpark.length ? svgSpark(projSpark, '#FFC20E', 144, 22) + `<div class="gspark-lbl">→ ${(limit * 0.75).toFixed(2)} cores in ${data.coreProj.daysTo75 ? data.coreProj.daysTo75.toFixed(1) + 'd' : '—'} · r² ${data.coreProj.reg.r2.toFixed(2)}</div>` : '<div class="gspark-lbl" style="padding:14px 0">insufficient data</div>'}</div>
      </div>
    </div>
    <div class="baro-row">
      <div class="baro-card">
        <div class="baro-t">${tipIcon('barometer')} CPU Core Barometer <span style="font-size:9px;color:#2d3748;margin-left:4px">(15-sec, last 30min)</span></div>
        ${CAP.core_3min ? '<div class="ch sm" id="ch-baro"></div>' : '<div style="font-size:11px;color:#334155;padding:8px">Core/3m not captured. Open the SiteGround CPU stats page to capture it automatically.</div>'}
      </div>
      <div class="baro-card">
        <div class="baro-t">🧠 Memory Barometer <span style="font-size:9px;color:#2d3748;margin-left:4px">(15-sec, last 30min)</span></div>
        ${CAP.mem_3min ? '<div class="ch sm" id="ch-mbaro"></div>' : '<div style="font-size:11px;color:#334155;padding:8px">Mem/3m not captured. Open the SiteGround Memory Usage panel and switch to <strong>Last 30 Min</strong>.</div>'}
      </div>
    </div>
    <div class="baro-row" style="grid-template-columns:1.4fr 1fr">
      <div class="baro-card">
        <div class="baro-t">⚠️ Alerts &amp; Signals</div>
        <div class="alert-list">${alerts.length ? alerts.map(a => `<div class="alert-item ${a.lvl}"><span class="alert-ico">${a.lvl === 'ok' ? '✅' : a.lvl === 'warn' ? '⚠️' : '🔴'}</span><span>${a.msg}</span></div>`).join('') : '<div class="alert-item ok"><span class="alert-ico">✅</span><span>No anomalies detected. Server appears healthy.</span></div>'}</div>
      </div>
      <div class="comp-card">
        <div class="baro-t">📊 Server Composition <span style="font-size:9px;color:#2d3748;margin-left:4px">share of last complete hour (${fmtN(compTotal)} CPU sec total)</span></div>
        ${composition.length ? `<div style="margin-top:6px">${svgStacked(composition, 360, 22)}</div>
        <div class="comp-list">${composition.slice(0, 6).map(seg => `<div class="comp-row"><span class="dot" style="background:${seg.color}"></span><span class="nm">${esc(seg.label)}</span><span class="v">${fmtD((seg.value / compTotal) * 100, 1)}%</span></div>`).join('')}${composition.length > 6 ? `<div class="comp-row" style="opacity:.6"><span class="dot" style="background:#334155"></span><span class="nm">+ ${composition.length - 6} more sites</span><span class="v">${fmtD((composition.slice(6).reduce( (s, x) => s + x.value, 0) / compTotal) * 100, 1)}%</span></div>` : ''}</div>` : '<div style="font-size:11px;color:#334155;padding:8px">Hourly capture needed — open <strong>CPU Seconds → 24 Hours</strong>.</div>'}
      </div>
    </div>
    <div class="cw">
      <div class="cw-t">📈 24-Hour CPU per Site ${tipIcon('cpu_seconds')}<span class="cw-hint">Each bar is one hour. Coloured segments show which sites contributed. The white line is server-wide cores in use on the right axis — when it crosses the red 75%-of-plan line, users start feeling slowdowns. Hover any bar for exact numbers.</span></div>
      <div class="ch tall" id="ch-h24"></div>
    </div>
    <div class="cw">
      <div class="cw-t">📊 24-Hour Share — top 5 sites' share of account CPU over time ${tipIcon('cpu_seconds')}<span class="cw-hint">A flat line near 100% means that site has been dominant the whole period. Diverging lines mean traffic is shifting between sites. Useful for spotting bursts: a sudden climb = that site is using disproportionately more right now.</span></div>
      <div class="ch sm" id="ch-h24-share"></div>
    </div>
    <div class="sec">
      <div class="sec-t">Site Health Snapshot ${tipIcon('cpu_seconds')} <span style="font-size:10px;color:#334155;font-weight:400;margin-left:6px">click a row for drilldown · status uses each site's own 30d baseline</span></div>
      ${renderHealthTable(data, h)}
    </div>`;
        setTimeout( () => {
            initBaro();
            initMemBaro();
            initH24(data, h);
        }
        , 0);
    }
    ;

    // Primary suspect card — joins live cores in use, the site's last-hour CPU,
    // its share of the account, and its ratio vs its own 7d hourly average into one sentence.
    const renderSuspectCard = (s, liveCores, limit) => {
        const planPct = (liveCores !== null && limit) ? (liveCores / limit) * 100 : null;
        const cls = s.ratio >= 3 ? 'crit' : s.ratio >= 1.75 ? 'warn' : planPct > 60 ? 'warn' : 'ok';
        const ico = cls === 'crit' ? '🔍🔴' : cls === 'warn' ? '🔍⚠️' : '🔍';
        const ratioStr = s.expHr > 0 ? `<strong>${s.ratio.toFixed(1)}×</strong> its 7d hourly avg (${fmtN(s.expHr)}/hr)` : '';
        const pressure = liveCores !== null && limit ? `Server using <strong>${liveCores.toFixed(2)} of ${limit} cores</strong> (${planPct.toFixed(0)}% of plan). ` : '';
        return `<div class="sbar ${cls}" style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-size:20px;flex-shrink:0">${ico}</div>
      <div style="line-height:1.55">
        <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;opacity:.8;margin-bottom:2px">Primary Suspect</div>
        ${pressure}<strong>${esc(s.domain)}</strong> used <strong>${fmtN(s.lastHr)}</strong> CPU sec last hour — ${ratioStr}${ratioStr ? '. ' : ''}Currently <strong>${fmtD(s.share)}%</strong> of account 30d total.
      </div>
    </div>`;
    }
    ;

    const renderHealthTable = (data, h) => {
        const rows = data.siteStats.filter(s => s.total > 0).map(s => {
            const sp = h ? h.sites.find(x => x.domain === s.domain) : null;
            const lastHr = sp ? lastCompleteHourly(sp.points) : null;
            const hrAvg = s.avg7 / 24;
            const vsHr = hrAvg > 0 && lastHr !== null ? lastHr / hrAvg : null;
            const cls = classifyVsBaseline(s.lastCompleteVal || 0, s.baseline);
            const sColor = cls.sev === 0 ? 'cg' : cls.sev === 1 ? 'cw2' : 'cr';
            const sLabel = cls.label === '—' ? (vsHr === null ? '—' : vsHr < 1.5 ? 'Normal' : vsHr < 3 ? 'Elevated' : '⚠ High') : cls.label;
            const baseStr = s.baseline ? `${fmtN(s.baseline.med)} (μ+2σ ${fmtN(s.baseline.hi)})` : 'insufficient';
            const tc = s.trend7 === null ? 'cd' : +s.trend7 < -5 ? 'cg' : +s.trend7 > 20 ? 'cr' : 'cn';
            return `<tr class="drillrow sev${cls.sev}" data-drill="${esc(s.domain)}" title="Click for drilldown">
      <td class="mono">${esc(s.domain)}</td>
      <td class="r">${lastHr !== null ? fmtN(lastHr) : '—'}</td>
      <td class="r">${fmtN(s.avg7 / 24)}</td>
      <td class="r ${vsHr === null ? 'cn' : vsHr < 1.5 ? 'cg' : vsHr < 3 ? 'cw2' : 'cr'}">${vsHr !== null ? vsHr.toFixed(2) + '×' : '—'}</td>
      <td class="r" title="median (anomaly threshold)">${baseStr}</td>
      <td class="r">${fmtN(s.peak)}</td>
      <td class="r ${tc}">${s.trend7 === null ? '—' : signStr(s.trend7)}</td>
      <td>${svgSpark(s.dailyVals, '#27AAE1', 80, 22)}</td>
      <td><span class="${sColor}" style="font-weight:700">${sLabel}</span></td>
    </tr>`;
        }
        );
        return `<div class="tw"><table><thead><tr>
    <th>Domain</th>
    <th class="r" title="CPU sec last completed hour">Last Hr</th>
    <th class="r" title="7-day avg / 24 = expected hourly">7d Avg/Hr</th>
    <th class="r" ${tipAttr('cpu_seconds')}>vs 7d Hourly</th>
    <th class="r" title="Site's own median CPU/day and anomaly threshold (μ + 2σ or p95×1.2)">Own Baseline</th>
    <th class="r" ${tipAttr('peak_day')}>30d Peak</th>
    <th class="r" ${tipAttr('trend7')}>7d Trend</th>
    <th>30d Trend</th>
    <th title="Status uses each site's own 30d distribution as baseline">Status</th>
  </tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    }
    ;

    // Drilldown overlay — opens when a site row in the Health snapshot is clicked.
    // Shows the site's full daily series, baseline distribution, hourly profile, and CPU/exec series.
    const openSiteDrilldown = (data, domain) => {
        const s = data.siteStats.find(x => x.domain === domain);
        if (!s)
            return;
        document.getElementById('sgd-drill-overlay')?.remove();
        const h = buildHourlyData();
        const sp = h ? h.sites.find(x => x.domain === domain) : null;
        const lastHr = sp ? lastCompleteHourly(sp.points) : null;
        const cls = classifyVsBaseline(s.lastCompleteVal || 0, s.baseline);
        const overlay = document.createElement('div');
        overlay.id = 'sgd-drill-overlay';
        overlay.className = 'drill-overlay';
        overlay.innerHTML = `<div class="drill-modal" id="sgd-drill-modal" data-theme="${S.ui.theme}" onclick="event.stopPropagation()">
      <div class="drill-hdr">
        <h3>🔎 ${esc(domain)}</h3>
        <span style="font-size:10px;color:#475569">Rank #${s.rank} · ${fmtD(s.shareOfAccount)}% of account · status <strong class="${cls.sev === 0 ? 'cg' : cls.sev === 1 ? 'cw2' : 'cr'}">${esc(cls.label)}</strong></span>
        <button class="btn sec sm" data-a="close-drill">✕</button>
      </div>
      <div class="drill-stats">
        <div class="drill-stat"><div class="t">Last complete day</div><div class="v ${cls.sev === 0 ? 'cg' : cls.sev === 1 ? 'cw2' : 'cr'}">${fmtN(s.lastCompleteVal || 0)}</div><div class="s">${esc(s.lastCompleteDate || '')}</div></div>
        <div class="drill-stat"><div class="t">Last complete hour</div><div class="v">${lastHr !== null ? fmtN(lastHr) : '—'}</div><div class="s">7d avg/hr ${fmtN(s.avg7 / 24)}</div></div>
        <div class="drill-stat"><div class="t">30d avg/day</div><div class="v">${fmtN(s.avg)}</div><div class="s">7d ${fmtN(s.avg7)}</div></div>
        <div class="drill-stat"><div class="t">Baseline median</div><div class="v">${s.baseline ? fmtN(s.baseline.med) : '—'}</div><div class="s">IQR ${s.baseline ? fmtN(s.baseline.iqr) : '—'}</div></div>
        <div class="drill-stat"><div class="t">Anomaly threshold</div><div class="v cw2">${s.baseline ? fmtN(s.baseline.hi) : '—'}</div><div class="s">μ + 2σ or p95×1.2</div></div>
        <div class="drill-stat"><div class="t">30d peak</div><div class="v cr">${fmtN(s.peak)}</div><div class="s">${esc(s.peakDate || '')}</div></div>
        <div class="drill-stat"><div class="t">7d trend</div><div class="v ${clsCh(s.trend7)}">${s.trend7 === null ? '—' : signStr(s.trend7)}</div><div class="s">week-on-week</div></div>
        <div class="drill-stat"><div class="t">CPU / execution</div><div class="v">${s.cpuPerExec ? fmtD(s.cpuPerExec, 2) : '—'}</div><div class="s">avg cost per request</div></div>
      </div>
      <div class="cw"><div class="cw-t">Daily CPU — with own baseline overlay</div><div class="ch" id="ch-drill-daily" style="height:240px"></div></div>
      ${sp ? `<div class="cw"><div class="cw-t">Last 24 hours — hourly CPU</div><div class="ch" id="ch-drill-hourly" style="height:200px"></div></div>` : ''}
      ${data.hasExec && s.cpuExSeries.some(v => v > 0) ? `<div class="cw"><div class="cw-t">CPU per execution — daily (cost per request over time)</div><div class="ch" id="ch-drill-cpex" style="height:200px"></div></div>` : ''}
    </div>`;
        overlay.addEventListener('click', e => {
            if (e.target === overlay)
                overlay.remove();
        }
        );
        overlay.querySelector('[data-a="close-drill"]').onclick = () => overlay.remove();
        document.body.appendChild(overlay);
        setTimeout( () => initDrillCharts(data, s, sp), 0);
    }
    ;
    const initDrillCharts = (data, s, sp) => {
        // Daily CPU with baseline lines
        const dailySeries = [{
            name: 'CPU',
            type: 'line',
            data: data.dates.map( (d, i) => s.dailyVals[i] || 0),
            smooth: true,
            symbol: 'circle',
            symbolSize: 3,
            lineStyle: {
                color: '#27AAE1',
                width: 2
            },
            itemStyle: {
                color: '#27AAE1'
            },
            areaStyle: {
                color: 'rgba(96,165,250,0.08)'
            }
        }];
        if (s.baseline) {
            dailySeries.push({
                name: 'Median',
                type: 'line',
                data: data.dates.map( () => s.baseline.med),
                symbol: 'none',
                lineStyle: {
                    color: '#94a3b8',
                    type: 'dashed',
                    width: 1
                }
            });
            dailySeries.push({
                name: 'Anomaly threshold',
                type: 'line',
                data: data.dates.map( () => s.baseline.hi),
                symbol: 'none',
                lineStyle: {
                    color: '#f87171',
                    type: 'dashed',
                    width: 1
                }
            });
        }
        cinit('ch-drill-daily', {
            ...BASE,
            grid: {
                left: 56,
                right: 16,
                top: 18,
                bottom: 56
            },
            legend: {
                ...BASE.legend,
                bottom: 4,
                data: dailySeries.map(x => x.name)
            },
            xAxis: {
                ...BASE.xAxis,
                data: data.dates
            },
            yAxis: mkY('CPU sec', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }),
            series: dailySeries,
            dataZoom: [...BASE.dataZoom]
        });
        // Hourly profile
        if (sp) {
            const h = buildHourlyData();
            cinit('ch-drill-hourly', {
                ...BASE,
                grid: {
                    left: 56,
                    right: 16,
                    top: 12,
                    bottom: 38
                },
                legend: {
                    show: false
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: h.secLabels,
                    axisLabel: {
                        ...BASE.xAxis.axisLabel,
                        interval: Math.floor(h.secLabels.length / 8)
                    }
                },
                yAxis: mkY('CPU sec/hr', {
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => fmtN(v)
                    }
                }),
                series: [{
                    name: 'CPU/hr',
                    type: 'line',
                    data: h.secLabels.map( (_, i) => Math.round(sp.points?.[i]?.value || 0)),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 3,
                    lineStyle: {
                        color: '#34d399',
                        width: 2
                    },
                    itemStyle: {
                        color: '#34d399'
                    },
                    areaStyle: {
                        color: 'rgba(52,211,153,0.1)'
                    },
                    markLine: s.avg7 > 0 ? {
                        silent: true,
                        lineStyle: {
                            color: '#94a3b8',
                            type: 'dashed',
                            width: 1
                        },
                        data: [{
                            yAxis: +(s.avg7 / 24).toFixed(0)
                        }],
                        label: {
                            formatter: '7d avg/hr',
                            color: '#94a3b8',
                            fontSize: 9
                        }
                    } : undefined
                }],
                dataZoom: [...BASE.dataZoom]
            });
        }
        // CPU/exec time series
        if (data.hasExec && s.cpuExSeries.some(v => v > 0)) {
            cinit('ch-drill-cpex', {
                ...BASE,
                grid: {
                    left: 56,
                    right: 16,
                    top: 12,
                    bottom: 38
                },
                legend: {
                    show: false
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: data.dates
                },
                yAxis: mkY('sec/exec', {
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => v.toFixed(2)
                    }
                }),
                series: [{
                    type: 'line',
                    data: s.cpuExSeries.map(v => +v.toFixed(3)),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 3,
                    lineStyle: {
                        color: '#FFC20E',
                        width: 2
                    },
                    itemStyle: {
                        color: '#FFC20E'
                    },
                    areaStyle: {
                        color: 'rgba(251,191,36,0.08)'
                    }
                }],
                dataZoom: [...BASE.dataZoom]
            });
        }
    }
    ;

    const initBaro = () => {
        if (!CAP.core_3min)
            return;
        const pts = CAP.core_3min.data.points || [];
        const lims = CAP.core_3min.data.limits_list || [];
        const ml = lims.length ? Math.max(...lims.map(p => +p.value)) : 9;
        // Cores in use at 15-sec resolution (raw / 100). Plan-immune.
        const coresVals = pts.map(p => +((+p.value) / 100).toFixed(3));
        const labels = pts.map(p => new Date(+p.timestamp * 1000).toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
        cinit('ch-baro', {
            ...BASE,
            grid: {
                left: 44,
                right: 16,
                top: 8,
                bottom: 26
            },
            legend: {
                show: false
            },
            tooltip: {
                ...BASE.tooltip,
                formatter: p => `${p[0].axisValue} — <strong>${(+p[0].value).toFixed(2)} / ${ml} cores</strong> (${((+p[0].value / ml) * 100).toFixed(1)}%) ${+p[0].value > ml * 0.8 ? '🔴' : +p[0].value > ml * 0.6 ? '⚠️' : '✅'}`
            },
            xAxis: {
                ...BASE.xAxis,
                data: labels,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    rotate: 0,
                    interval: Math.floor(labels.length / 6)
                }
            },
            yAxis: {
                ...BASE.yAxis,
                min: 0,
                max: Math.max(Math.max(...coresVals) * 1.1, ml * 0.5),
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => (+v).toFixed(1)
                }
            },
            series: [{
                type: 'line',
                data: coresVals,
                symbol: 'none',
                smooth: false,
                lineStyle: {
                    color: '#27AAE1',
                    width: 1.5
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(39,170,225,0.35)'
                        }, {
                            offset: 1,
                            color: 'rgba(96,165,250,0.02)'
                        }]
                    }
                },
                markLine: {
                    silent: true,
                    lineStyle: {
                        color: '#ef4444',
                        type: 'dashed',
                        width: 1
                    },
                    data: [{
                        yAxis: +(ml * 0.75).toFixed(2)
                    }],
                    label: {
                        formatter: `${(ml * 0.75).toFixed(1)} (75%)`,
                        fontSize: 9,
                        color: '#ef4444'
                    }
                }
            }],
            dataZoom: [{
                type: 'inside',
                zoomOnMouseWheel: 'shift',
                moveOnMouseWheel: false
            }],
        });
    }
    ;

    const initMemBaro = () => {
        if (!CAP.mem_3min?.data?.points_series?.points_real)
            return;
        const realPts = CAP.mem_3min.data.points_series.points_real;
        const lims = CAP.mem_3min.data.limits_list || [];
        const planGb = lims.length ? +lims[lims.length - 1].value : null;
        // GB values directly (plan-immune).
        const gbVals = realPts.map(p => +(+p.value).toFixed(2));
        const labels = realPts.map(p => new Date(+p.timestamp * 1000).toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
        cinit('ch-mbaro', {
            ...BASE,
            grid: {
                left: 44,
                right: 16,
                top: 8,
                bottom: 26
            },
            legend: {
                show: false
            },
            tooltip: {
                ...BASE.tooltip,
                formatter: p => `${p[0].axisValue} — <strong>${(+p[0].value).toFixed(2)} GB${planGb ? ` / ${planGb} GB` : ''}</strong>${planGb ? ` (${((+p[0].value / planGb) * 100).toFixed(1)}%)` : ''} ${planGb && +p[0].value > planGb * 0.85 ? '🔴' : planGb && +p[0].value > planGb * 0.7 ? '⚠️' : '✅'}`
            },
            xAxis: {
                ...BASE.xAxis,
                data: labels,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    rotate: 0,
                    interval: Math.floor(labels.length / 6)
                }
            },
            yAxis: {
                ...BASE.yAxis,
                min: 0,
                max: planGb || Math.max(...gbVals, 1) * 1.1,
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => (+v).toFixed(1)
                }
            },
            series: [{
                type: 'line',
                data: gbVals,
                symbol: 'none',
                smooth: false,
                lineStyle: {
                    color: '#a78bfa',
                    width: 1.5
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(167,139,250,0.35)'
                        }, {
                            offset: 1,
                            color: 'rgba(167,139,250,0.02)'
                        }]
                    }
                },
                markLine: planGb ? {
                    silent: true,
                    lineStyle: {
                        color: '#ef4444',
                        type: 'dashed',
                        width: 1
                    },
                    data: [{
                        yAxis: +(planGb * 0.85).toFixed(2)
                    }],
                    label: {
                        formatter: `${(planGb * 0.85).toFixed(1)} GB (85%)`,
                        fontSize: 9,
                        color: '#ef4444'
                    }
                } : undefined
            }],
            dataZoom: [{
                type: 'inside',
                zoomOnMouseWheel: 'shift',
                moveOnMouseWheel: false
            }],
        });
    }
    ;

    // v3: 24hr view as discrete STACKED BARS showing absolute CPU per hour, with Core % overlay.
    // Each bar is one hour, segmented by site (colored). This avoids the failure mode of the
    // previous stacked-area % chart where one dominant site became a flat block obscuring detail.
    // A separate small line chart shows share % over time for the top sites.
    const initH24 = (data, h) => {
        if (!h)
            return;
        const STACK_N = 8;
        const ranked = h.sites
            .map(s => ({
                domain: s.domain,
                pts: s.points || []
            }))
            .map(s => ({
                ...s,
                total: s.pts.reduce( (t, p) => t + (+p.value || 0), 0)
            }))
            .sort( (a, b) => b.total - a.total);
        const top = ranked.slice(0, STACK_N);
        const rest = ranked.slice(STACK_N);
        const hours = h.secLabels.length;
        const totals = new Array(hours).fill(0);
        const seriesVals = top.map(s => s.pts.map(p => +p.value || 0));
        const restVals = new Array(hours).fill(0);
        for (let i = 0; i < hours; i++) {
            let row = 0;
            top.forEach( (s, k) => {
                row += seriesVals[k][i] || 0;
            }
            );
            rest.forEach(s => {
                const v = +(s.pts[i]?.value || 0);
                restVals[i] += v;
                row += v;
            }
            );
            totals[i] = row;
        }
        // Stacked BAR series for top sites + "other" lump
        const barSeries = top.map( (s, i) => ({
            name: s.domain,
            type: 'bar',
            stack: 'cpu',
            data: seriesVals[i].map(v => Math.round(v)),
            itemStyle: {
                color: CFG.palette[i % CFG.palette.length],
                borderColor: 'rgba(0,0,0,0.15)',
                borderWidth: 0.5
            },
            emphasis: {
                focus: 'series'
            }
        }));
        if (rest.length && restVals.some(v => v > 0)) {
            barSeries.push({
                name: `+ ${rest.length} other`,
                type: 'bar',
                stack: 'cpu',
                data: restVals.map(v => Math.round(v)),
                itemStyle: {
                    color: themeChartColors().text,
                    opacity: 0.45
                }
            });
        }
        cinit('ch-h24', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: [...barSeries.map(s => s.name), 'Cores in Use']
            },
            grid: {
                ...BASE.grid,
                bottom: 84,
                right: 78
            },
            tooltip: {
                ...BASE.tooltip,
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: params => {
                    const idx = params[0].dataIndex;
                    const hourTotal = totals[idx] || 0;
                    const lines = params
                        .filter(p => p.seriesName !== 'Cores in Use' && p.value > 0)
                        .sort( (a, b) => b.value - a.value)
                        .map(p => `<span style="color:${p.color}">●</span> ${esc(p.seriesName)} <strong>${fmtN(p.value)}</strong> (${hourTotal > 0 ? ((p.value / hourTotal) * 100).toFixed(1) : '0'}%)`);
                    const corePart = params.find(p => p.seriesName === 'Cores in Use');
                    const coreLine = corePart ? `<br><span style="color:${themeChartColors().tipText}">━</span> Cores in Use <strong>${(+corePart.value).toFixed(2)} / ${h.maxLimit}</strong> (${((corePart.value / h.maxLimit) * 100).toFixed(1)}% of plan)` : '';
                    return `<strong>${params[0].axisValue}</strong> · ${fmtN(hourTotal)} CPU sec total<br>${lines.join('<br>') || '<em>no activity</em>'}${coreLine}`;
                }
            },
            xAxis: {
                ...BASE.xAxis,
                data: h.coreLabels,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    interval: Math.floor(h.coreLabels.length / 10)
                }
            },
            yAxis: [mkY('CPU sec/hr', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }), mkY('Cores in Use', {
                min: 0,
                max: h.maxLimit,
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => `${(+v).toFixed(1)}`
                }
            })],
            series: [...barSeries, {
                name: 'Cores in Use',
                type: 'line',
                data: h.coresVals,
                yAxisIndex: 1,
                smooth: true,
                symbol: 'circle',
                symbolSize: 3,
                lineStyle: {
                    color: themeChartColors().tipText,
                    width: 2
                },
                itemStyle: {
                    color: themeChartColors().tipText
                },
                z: 10,
                markLine: {
                    silent: true,
                    lineStyle: {
                        color: '#ef4444',
                        type: 'dashed',
                        width: 1
                    },
                    data: [{
                        yAxis: +(h.maxLimit * 0.75).toFixed(2)
                    }],
                    label: {
                        formatter: `${(h.maxLimit * 0.75).toFixed(1)} (75%)`,
                        fontSize: 9.5,
                        color: '#ef4444'
                    }
                }
            }],
            dataZoom: [...BASE.dataZoom],
        });
        // Companion share-% line chart: makes it obvious when one site dominates relative share
        const shareSeries = top.slice(0, 5).map( (s, i) => ({
            name: s.domain,
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: seriesVals[i].map( (v, idx) => totals[idx] > 0 ? +((v / totals[idx]) * 100).toFixed(1) : 0),
            lineStyle: {
                color: CFG.palette[i % CFG.palette.length],
                width: 2
            },
            itemStyle: {
                color: CFG.palette[i % CFG.palette.length]
            }
        }));
        cinit('ch-h24-share', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 4,
                data: top.slice(0, 5).map(s => s.domain)
            },
            grid: {
                left: 56,
                right: 24,
                top: 12,
                bottom: 46
            },
            tooltip: {
                ...BASE.tooltip,
                trigger: 'axis',
                formatter: params => {
                    const items = params.filter(p => p.value > 0).sort( (a, b) => b.value - a.value).map(p => `<span style="color:${p.color}">●</span> ${esc(p.seriesName)} <strong>${p.value}%</strong>`);
                    return `<strong>${params[0].axisValue}</strong><br>${items.join('<br>')}`;
                }
            },
            xAxis: {
                ...BASE.xAxis,
                data: h.coreLabels,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    interval: Math.floor(h.coreLabels.length / 8)
                }
            },
            yAxis: mkY('Share %', {
                min: 0,
                max: 100,
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => `${v}%`
                }
            }),
            series: shareSeries,
            dataZoom: []
        });
    }
    ;

    // ── SITES TAB ─────────────────────────────────────────────────────────────
    const renderSites = data => {
        const body = document.getElementById('sgd-body');
        const gs = groupSites(data, S.ui.group);
        if (!S.ui.selectedSites.size)
            gs.slice(0, 6).forEach(s => S.ui.selectedSites.add(s.domain));
        const sel = S.ui.selectedSites;
        const sorted = [...data.siteStats].sort( (a, b) => {
            const av = +(a[S.ui.sortKey] ?? 0)
              , bv = +(b[S.ui.sortKey] ?? 0);
            return S.ui.sortDir < 0 ? bv - av : av - bv;
        }
        );
        // Per-column tooltip map. Keyed by sort-key so each column has the right explanation.
        const colTips = {
            rank: 'Account-wide rank by 30-day total CPU. 1 = biggest consumer.',
            domain: 'The site hostname. Click the row to drill into this site\'s daily/hourly detail.',
            total: 'Total CPU seconds the site consumed over the captured window (typically 30 days).',
            avg: 'Average CPU sec/day. Computed across only non-zero days so a dead/parked site doesn\'t skew the average.',
            avg7: 'Average CPU sec/day over the last 7 complete days. Use this for "recent behaviour" rather than the 30d figure.',
            peak: 'Highest single-day CPU consumption in the window. Compare to avg/day — a peak many times the average means the site is spiky.',
            peakDate: 'The date on which the peak occurred.',
            shareOfAccount: 'This site\'s share of the entire account\'s CPU over the window. Independent of total traffic.',
            execTotal: 'Total PHP-FPM invocations over the window. Volume signal.',
            cpuPerExec: 'Average CPU sec per PHP execution. Cost-per-request. Lower = leaner.',
            trend7: 'Week-on-week percent change in average daily CPU. Negative = improving.',
            burstScore: 'Peak hour CPU divided by 24-hour total. High = one hour does most of the work (cron / batch); low = steady spread.'
        };
        const th = (k, l, c='') => {
            const tip = colTips[k];
            return `<th class="${c} ${S.ui.sortKey === k ? 'sk' : ''}" data-sort="${k}"${tip ? ` data-tip="${esc(tip)}"` : ''}>${esc(l)}${S.ui.sortKey === k ? (S.ui.sortDir < 0 ? ' ▾' : ' ▴') : ''}</th>`;
        }
        ;
        body.innerHTML = `
    ${introCard('sites')}
    <div class="ctrl-row">${groupCtrl()}
      <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-muted);cursor:pointer;align-self:flex-end;padding-bottom:6px">
        <input type="checkbox" id="show-avg" ${S.ui.showAvgLine ? 'checked' : ''}> Show 30d avg line
      </label>
    </div>
    <div style="font-size:10.5px;color:#334155;margin-bottom:4px">Toggle sites on chart:</div>
    <div class="site-picker">${sitePicker(gs, sel)}</div>
    <div class="cw"><div class="cw-t">🗺️ Site Composition — 30-day CPU breakdown ${tipIcon('cpu_seconds')}<span class="cw-hint">Each rectangle is a site. Size = how much CPU it used over 30 days. Larger rectangles = bigger workload. Click a rectangle to focus on that site below.</span></div><div class="ch" id="ch-sites-tree" style="height:280px"></div></div>
    <div class="cw"><div class="cw-t">Daily CPU — selected sites ${tipIcon('cpu_seconds')}<span class="cw-hint">Time series of each selected site's CPU per day. Use the chips above to toggle sites on/off. Sharp spikes vs trends reveal incidents vs growth.</span></div><div class="ch tall" id="ch-sites"></div></div>
    ${data.hasExec ? `<div class="cw"><div class="cw-t">Program Executions — selected sites ${tipIcon('program_executions')}</div><div class="ch" id="ch-sites-exec"></div></div>` : ''}
    <div class="cw"><div class="cw-t">CPU / Execution ratio — efficiency benchmark ${tipIcon('cpu_exec_ratio')}</div><div class="ch" id="ch-ratio" style="height:210px"></div></div>
    <div class="sec">
      <div class="sec-t">All ${data.siteStats.length} Sites ${tipIcon('cpu_seconds')}</div>
      <div class="tw"><table><thead><tr>
        ${th('rank', '#', 'r')}${th('domain', 'Domain')}${th('total', 'Total CPU', 'r')}${th('avg', 'Avg/Day', 'r')}${th('avg7', '7d Avg', 'r')}${th('peak', 'Peak', 'r')}${th('peakDate', 'Peak Date')}${th('shareOfAccount', '% Acct', 'r')}
        ${data.hasExec ? th('execTotal', 'Exec', 'r') + th('cpuPerExec', 'CPU/Exec', 'r') : ''}
        ${data.hasBurst ? `<th class="r ${S.ui.sortKey === 'burstScore' ? 'sk' : ''}" data-sort="burstScore" ${tipAttr('burst_score')}>Burst<br><span style="font-size:8.5px;color:var(--text-faint);font-weight:500">last captured 24h</span></th>` : ''}
        ${th('trend7', '7d Trend', 'r')}<th>Sparkline</th><th data-tip="${esc('<strong>Exclude</strong> — remove this site from every per-site calculation (rankings, network DiD, treemap, group selectors). Server-wide cores in use / GB used / live barometers are unaffected. Click again to restore.')}">Filter</th>
      </tr></thead><tbody>
      ${sorted.map(s => {
            const tc = s.trend7 === null ? 'cd' : +s.trend7 < -5 ? 'cg' : +s.trend7 > 20 ? 'cr' : 'cn';
            const on = sel.has(s.domain);
            const deadBit = s.isDead ? `<span class="dead-badge" ${tipAttr('dead_site')}>dead</span>` : s.isQuiet ? `<span class="dead-badge" style="border-style:dotted">quiet</span>` : '';
            let burstBit = '<td class="r cd">—</td>';
            if (data.hasBurst) {
                if (s.burstScore !== undefined) {
                    const bcls = s.burstScore < 10 ? 'lo' : s.burstScore > 25 ? 'hi' : '';
                    burstBit = `<td class="r"><span class="burst-pill ${bcls}" ${tipAttr('burst_score')}>${s.burstScore.toFixed(0)}%</span></td>`;
                }
            }
            const exclBtn = `<button class="row-action-btn ${s.isExcluded ? 'is-excl' : ''}" data-excl-toggle="${esc(s.domain)}" title="${s.isExcluded ? 'Restore — include in per-site calculations' : 'Exclude — drop from per-site calculations'}">${s.isExcluded ? '↩ restore' : '🚫 exclude'}</button>`;
            const exclBadge = s.isExcluded ? ' <span class="act-badge" style="background:var(--warn-bg);border-color:var(--warn-border);color:var(--warn)">excluded</span>' : '';
            return `<tr class="${on ? 'hi' : ''} ${s.isDead ? 'incomplete' : ''} ${s.isExcluded ? 'excluded-site' : ''}">
        <td class="r cd">${s.rank}</td>
        <td class="mono" style="cursor:pointer" data-sp="${esc(s.domain)}">${esc(s.domain)}${deadBit}${exclBadge}</td>
        <td class="r">${fmtN(s.total)}</td><td class="r">${fmtN(s.avg)}</td><td class="r">${fmtN(s.avg7)}</td>
        <td class="r">${fmtN(s.peak)}</td><td>${esc(s.peakDate)}</td><td class="r">${fmtD(s.shareOfAccount)}%</td>
        ${data.hasExec ? `<td class="r">${fmtN(s.execTotal)}</td><td class="r">${s.cpuPerExec ? fmtD(s.cpuPerExec, 1) : '—'}</td>` : ''}
        ${data.hasBurst ? burstBit : ''}
        <td class="r ${tc}">${s.trend7 === null ? '—' : signStr(s.trend7)}</td>
        <td>${svgSpark(s.dailyVals, on ? '#27AAE1' : '#0074B4', 80, 22)}</td>
        <td>${exclBtn}</td>
      </tr>`;
        }
        ).join('')}
      </tbody></table></div>
    </div>`;
        setTimeout( () => initSitesCharts(data), 0);
    }
    ;

    const initSitesCharts = data => {
        const sel = S.ui.selectedSites;
        const ss = data.siteStats.filter(s => sel.has(s.domain));
        const acctAvg = data.benchmarks.acct.avg30;
        // Treemap of 30-day site composition
        const tree = data.siteStats.filter(s => s.total > 0).map( (s, i) => ({
            name: s.domain,
            value: Math.round(s.total),
            itemStyle: {
                color: CFG.palette[i % CFG.palette.length]
            }
        }));
        cinit('ch-sites-tree', {
            backgroundColor: 'transparent',
            tooltip: {
                ...BASE.tooltip,
                formatter: p => `<strong>${esc(p.name)}</strong><br>${fmtN(p.value)} CPU sec (30d)<br>${fmtD((p.value / data.acctTotal) * 100, 1)}% of account`
            },
            series: [{
                type: 'treemap',
                data: tree,
                roam: false,
                nodeClick: false,
                breadcrumb: {
                    show: false
                },
                label: {
                    show: true,
                    formatter: p => p.value > data.acctTotal * 0.02 ? `${p.name.split('.')[0]}\n${fmtD((p.value / data.acctTotal) * 100, 1)}%` : '',
                    fontSize: 11,
                    color: '#fff',
                    textShadowColor: 'rgba(0,0,0,0.4)',
                    textShadowBlur: 2
                },
                itemStyle: {
                    borderColor: themeChartColors().tipBg,
                    borderWidth: 2,
                    gapWidth: 2
                },
                levels: [{
                    itemStyle: {
                        gapWidth: 2
                    }
                }]
            }]
        });
        cinit('ch-sites', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: ss.map(s => s.domain)
            },
            grid: {
                ...BASE.grid,
                bottom: 76
            },
            xAxis: {
                ...BASE.xAxis,
                data: data.dates
            },
            yAxis: mkY('CPU Seconds', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }),
            series: [...ss.map( (s, i) => ({
                ...mkLn(s.domain, data.dates.map(d => Math.round(data.sv(s.domain, d))), CFG.palette[i % CFG.palette.length], {
                    markLine: S.ui.showAvgLine ? benchMark(s.dailyVals, CFG.palette[i % CFG.palette.length]) : undefined,
                })
            })), ...(S.ui.showAvgLine ? [{
                name: 'Acct avg',
                type: 'line',
                data: data.dates.map( () => Math.round(acctAvg)),
                lineStyle: {
                    color: '#0074B4',
                    type: 'dotted',
                    width: 2
                },
                itemStyle: {
                    color: '#0074B4'
                },
                symbol: 'none',
                tooltip: {
                    show: false
                },
                z: 0
            }] : []), ],
            dataZoom: [...BASE.dataZoom],
        });
        if (data.hasExec)
            cinit('ch-sites-exec', {
                ...BASE,
                legend: {
                    ...BASE.legend,
                    bottom: 28,
                    data: ss.map(s => s.domain)
                },
                grid: {
                    ...BASE.grid,
                    bottom: 76
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: data.dates
                },
                yAxis: mkY('Executions', {
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => fmtN(v)
                    }
                }),
                series: ss.map( (s, i) => ({
                    ...mkLn(s.domain, data.dates.map(d => Math.round(data.ev(s.domain, d))), CFG.palette[i % CFG.palette.length], {
                        smooth: true,
                        symbol: 'none'
                    })
                })),
                dataZoom: [...BASE.dataZoom],
            });
        // CPU/exec horizontal bar chart
        const rs = data.siteStats.filter(s => s.cpuPerExec && s.total > 500).slice(0, 12);
        cinit('ch-ratio', {
            ...BASE,
            grid: {
                left: 155,
                right: 60,
                top: 8,
                bottom: 26
            },
            legend: {
                show: false
            },
            xAxis: {
                ...BASE.xAxis,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    rotate: 0
                }
            },
            yAxis: {
                ...BASE.yAxis,
                type: 'category',
                data: rs.map(s => s.domain).reverse(),
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    fontSize: 10
                }
            },
            series: [{
                type: 'bar',
                data: rs.map(s => +(s.cpuPerExec).toFixed(2)).reverse(),
                itemStyle: {
                    color: p => p.value < 1 ? '#4ade80' : p.value < 3 ? '#FFC20E' : '#f87171'
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: p => `${p.value} sec/exec`,
                    fontSize: 9,
                    color: '#64748b'
                }
            }],
            tooltip: {
                ...BASE.tooltip,
                formatter: p => `${p.name}<br><strong>${p.value} CPU sec / execution</strong>`
            },
            dataZoom: [],
        });
    }
    ;

    // ── BEFORE/AFTER TAB ─────────────────────────────────────────────────────
    const renderCompare = data => {
        const body = document.getElementById('sgd-body');
        const sOpts = data.siteStats.filter(s => s.total > 0).map(s => `<option value="${esc(s.domain)}" ${s.domain === S.ui.target ? 'selected' : ''}>${esc(s.domain)}</option>`).join('');
        const cOpts = Object.entries(CTRL_PRESETS).map( ([k,v]) => `<option value="${k}" ${S.ui.ctrlPreset === k ? 'selected' : ''}>${esc(v)}</option>`).join('');
        const fOpts = Object.entries(FOCUS_PRESETS).map( ([k,v]) => `<option value="${k}" ${S.ui.fixFocus === k ? 'selected' : ''}>${esc(v)}</option>`).join('');
        const usingCustom = !!S.ui.useCustomDates;
        const cBefStart = S.ui.customBeforeStart || addDays(S.ui.fixDate, -S.ui.daysBefore);
        const cAftEnd = S.ui.customAfterEnd || addDays(S.ui.fixDate, S.ui.daysAfter - 1);
        body.innerHTML = `
    ${introCard('compare')}
    <div class="ctrl-row">
      <div class="fld"><label>Target Site</label><select id="cmp-tgt">${sOpts}</select></div>
      <div class="fld"><label>Fix Date ${tipIcon('fix_date')}</label><input type="date" id="cmp-fix" value="${S.ui.fixDate}"></div>
      <div class="fld" id="fld-before-n" ${usingCustom ? 'style="display:none"' : ''}><label>Days Before</label><input type="number" id="cmp-before" value="${S.ui.daysBefore}" min="1" max="60" style="width:57px"></div>
      <div class="fld" id="fld-after-n" ${usingCustom ? 'style="display:none"' : ''}><label>Days After</label><input type="number" id="cmp-after" value="${S.ui.daysAfter}" min="1" max="60" style="width:57px"></div>
      <div class="fld" id="fld-before-d" ${!usingCustom ? 'style="display:none"' : ''}><label>Before Start</label><input type="date" id="cmp-bstart" value="${esc(cBefStart)}"></div>
      <div class="fld" id="fld-after-d" ${!usingCustom ? 'style="display:none"' : ''}><label>After End</label><input type="date" id="cmp-aend" value="${esc(cAftEnd)}"></div>
      <div class="fld"><label>Fix Focus ${tipIcon('fix_focus')}</label><select id="cmp-focus">${fOpts}</select></div>
      <div class="fld"><label>Compare Against ${tipIcon('control_group')}</label><select id="cmp-ctrl">${cOpts}</select></div>
      <button class="btn" data-a="run-cmp">Run Analysis</button>
    </div>
    <div class="ctrl-row" style="gap:18px;margin-bottom:14px;padding:10px 14px;border:1px dashed var(--border);border-radius:var(--radius-sm);background:var(--bg-card-alt)">
      <span style="font-size:10.5px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em">Advanced filters</span>
      <label class="adv-toggle" data-tip="${esc('When on, the date inputs above switch from <strong>±N days around the fix</strong> to <strong>arbitrary date pickers</strong>. Use this when your before-window starts on a specific event (a prior fix, a plan upgrade) rather than a uniform N days.')}"><input type="checkbox" id="cmp-customdates" ${usingCustom ? 'checked' : ''}> Custom date range</label>
      <label class="adv-toggle" data-tip="${esc('Drop Saturday + Sunday from both windows. Useful when your traffic profile is dominated by weekday business activity and weekend behaviour would skew the average. Affects every calculation: averages, network DiD, weekday-paired residuals.')}"><input type="checkbox" id="cmp-weekdays" ${S.ui.weekdaysOnly ? 'checked' : ''}> Weekdays only</label>
      <div class="fld" style="flex-direction:row;align-items:center;gap:8px" data-tip="${esc('Drop very-low-traffic sites from the peer network and ranking. A site with 5 CPU sec/day swinging to 50 looks like +900% but that\'s noise. Setting this to e.g. 50 CPU sec/day keeps the network comparison meaningful.')}"><label style="margin:0;text-transform:none;letter-spacing:0;font-weight:600;color:var(--text-muted)">Min peer activity</label><input type="number" id="cmp-minact" value="${S.ui.minActivityCpu || 0}" min="0" step="10" style="width:78px;padding:6px 9px;font-size:11.5px"> <span style="font-size:10.5px;color:var(--text-faint)">CPU sec/day</span></div>
    </div>
    <div id="cmp-out"></div>`;
        // Auto-rerun on any input change. `change` covers selects + date pickers;
        // `input` is more responsive for number fields. Both call the same renderer
        // — buildCmp is fast enough (sub-50ms even on big accounts) to re-render
        // every keystroke without lag.
        const rerun = () => renderCmpOut(data);
        ['cmp-tgt', 'cmp-fix'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', rerun);
        }
        );
        // Control preset gets a wrapper so picking "Custom" opens the picker first.
        document.getElementById('cmp-ctrl')?.addEventListener('change', e => {
            if (e.target.value === 'custom') {
                openCustomCtrlPicker(data, rerun);
            } else {
                rerun();
            }
        }
        );
        ['cmp-before', 'cmp-after', 'cmp-bstart', 'cmp-aend', 'cmp-minact'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', rerun);
                el.addEventListener('input', rerun);
            }
        }
        );
        // Fix Focus drives the hero card and verdict — re-render on change. Persist so the
        // user's last analytic stance survives reloads.
        document.getElementById('cmp-focus')?.addEventListener('change', e => {
            S.ui.fixFocus = e.target.value;
            persistFixFocus();
            rerun();
        }
        );
        // Weekdays-only filter — recompute everything when toggled.
        document.getElementById('cmp-weekdays')?.addEventListener('change', e => {
            S.ui.weekdaysOnly = !!e.target.checked;
            rerun();
        }
        );
        // Custom date range toggle: swap the N-days inputs for date pickers, in place.
        // No re-render of the whole tab — just flip visibility of the existing .fld blocks.
        document.getElementById('cmp-customdates')?.addEventListener('change', e => {
            S.ui.useCustomDates = !!e.target.checked;
            const showCustom = S.ui.useCustomDates;
            ['fld-before-n', 'fld-after-n'].forEach(id => {
                const el = document.getElementById(id);
                if (el)
                    el.style.display = showCustom ? 'none' : '';
            }
            );
            ['fld-before-d', 'fld-after-d'].forEach(id => {
                const el = document.getElementById(id);
                if (el)
                    el.style.display = showCustom ? '' : 'none';
            }
            );
            rerun();
        }
        );
        renderCmpOut(data);
    }
    ;

    // Modal picker for the "Custom" comparison-group preset. Checkbox list of every
    // active site, sorted by CPU (heaviest first). Selection persisted to S.ui.customCtrl
    // and to localStorage so it survives reloads. Calls `onApply` when the user clicks Apply.
    // Cancel/backdrop click reverts the dropdown to the previously-applied preset.
    const openCustomCtrlPicker = (data, onApply) => {
        document.getElementById('sgd-custom-overlay')?.remove();
        const target = document.getElementById('cmp-tgt')?.value || S.ui.target;
        const sites = data.siteStats.filter(s => s.total > 0 && s.domain !== target);
        const picked = new Set(S.ui.customCtrl || []);
        const rows = sites.map(s => `
      <label class="cust-row">
        <input type="checkbox" data-d="${esc(s.domain)}" ${picked.has(s.domain) ? 'checked' : ''}>
        <span class="cust-nm">${esc(s.domain)}${s.isExcluded ? ' <span style="color:var(--warn);font-size:10px">(excluded)</span>' : ''}</span>
        <span class="cust-cpu">${fmtN(s.total)} CPU sec · ${fmtD(s.shareOfAccount, 1)}%</span>
      </label>`).join('');
        const overlay = document.createElement('div');
        overlay.id = 'sgd-custom-overlay';
        overlay.className = 'drill-overlay';
        overlay.setAttribute('data-theme', S.ui.theme);
        overlay.innerHTML = `
      <div class="drill-modal" style="max-width:560px;padding:22px 26px">
        <div class="drill-hdr">
          <h3 style="font-family:inherit">Pick comparison sites</h3>
          <button class="btn sec sm" id="sgd-custom-cancel">✕</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
          <input type="text" id="sgd-custom-search" placeholder="Search sites…" style="flex:1;padding:7px 11px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card-alt);color:var(--text-strong);font-size:12px">
          <button class="btn sec sm" id="sgd-custom-none">None</button>
          <button class="btn sec sm" id="sgd-custom-all">All</button>
        </div>
        <div id="sgd-custom-list" style="max-height:50vh;overflow-y:auto;padding-right:6px">${rows}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
          <span style="font-size:11.5px;color:var(--text-faint)" id="sgd-custom-count">${picked.size} selected</span>
          <button class="btn" id="sgd-custom-apply">Apply</button>
        </div>
      </div>`;
        document.body.appendChild(overlay);
        const list = overlay.querySelector('#sgd-custom-list');
        const countEl = overlay.querySelector('#sgd-custom-count');
        const updateCount = () => {
            countEl.textContent = `${list.querySelectorAll('input:checked').length} selected`;
        }
        ;
        list.addEventListener('change', updateCount);
        overlay.querySelector('#sgd-custom-all').addEventListener('click', () => {
            list.querySelectorAll('input').forEach(c => {
                if (c.closest('.cust-row').style.display !== 'none') c.checked = true;
            }
            );
            updateCount();
        }
        );
        overlay.querySelector('#sgd-custom-none').addEventListener('click', () => {
            list.querySelectorAll('input').forEach(c => c.checked = false);
            updateCount();
        }
        );
        overlay.querySelector('#sgd-custom-search').addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            list.querySelectorAll('.cust-row').forEach(r => {
                r.style.display = r.querySelector('.cust-nm').textContent.toLowerCase().includes(q) ? '' : 'none';
            }
            );
        }
        );
        const revertAndClose = () => {
            const ctrl = document.getElementById('cmp-ctrl');
            if (ctrl) ctrl.value = S.ui.ctrlPreset || 'auto';
            overlay.remove();
        }
        ;
        overlay.querySelector('#sgd-custom-cancel').addEventListener('click', revertAndClose);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) revertAndClose();
        }
        );
        overlay.querySelector('#sgd-custom-apply').addEventListener('click', () => {
            S.ui.customCtrl = [...list.querySelectorAll('input:checked')].map(c => c.dataset.d);
            S.ui.ctrlPreset = 'custom';
            persistCustomCtrl();
            overlay.remove();
            onApply();
        }
        );
    }
    ;

    // Modal that lists every site with an INCLUDED checkbox (unchecked = excluded).
    // Replaces the old "jump to the Sites tab to manage exclusions" flow with a single
    // inline picker reachable from both the header excl-chip and the Before/After filter
    // row. The current target is always included (checkbox forced + disabled). Calls
    // onApply after persisting the new exclusion set.
    const openSiteInclusionPanel = (data, onApply) => {
        document.getElementById('sgd-incl-overlay')?.remove();
        const target = document.getElementById('cmp-tgt')?.value || S.ui.target;
        // Show every site that registered any CPU at all (sorted heaviest first).
        // Pure-dead/parked sites don't appear in any per-site calc anyway, so omitting
        // them avoids a list dominated by zeros.
        const sites = data.siteStats.filter(s => s.total > 0).slice().sort( (a, b) => b.total - a.total);
        const initiallyExcluded = new Set(S.ui.excludedSites);
        const rows = sites.map(s => {
            const isTgt = s.domain === target;
            const isExcl = initiallyExcluded.has(s.domain);
            const checked = !isExcl || isTgt ? 'checked' : '';
            const tgtLbl = isTgt ? ' <span style="color:var(--accent);font-size:10px;font-weight:700">target</span>' : '';
            return `<label class="cust-row${isTgt ? ' is-target' : ''}">
        <input type="checkbox" data-d="${esc(s.domain)}" ${checked}${isTgt ? ' disabled' : ''}>
        <span class="cust-nm">${esc(s.domain)}${tgtLbl}</span>
        <span class="cust-cpu">${fmtN(s.total)} CPU sec · ${fmtD(s.shareOfAccount, 1)}%</span>
      </label>`;
        }
        ).join('');
        const overlay = document.createElement('div');
        overlay.id = 'sgd-incl-overlay';
        overlay.className = 'drill-overlay';
        overlay.setAttribute('data-theme', S.ui.theme);
        const initIncluded = sites.length - sites.filter(s => initiallyExcluded.has(s.domain) && s.domain !== target).length;
        overlay.innerHTML = `
      <div class="drill-modal" style="max-width:640px;padding:22px 26px">
        <div class="drill-hdr" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px">
          <h3 style="font-family:inherit;margin:0">Include / exclude sites</h3>
          <button class="btn sec sm" id="sgd-incl-cancel">✕</button>
        </div>
        <div style="font-size:11px;color:var(--text-faint);line-height:1.55;margin-bottom:12px">
          Unchecked sites are dropped from every per-site calculation: control group, network, ranking, and DiD.
          Server-wide metrics (cores in use, GB used, live barometers) are unaffected — SiteGround's API only reports those account-wide.
          The current <strong>target site</strong> is always included.
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
          <input type="text" id="sgd-incl-search" placeholder="Search sites…" style="flex:1;min-width:160px;padding:7px 11px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card-alt);color:var(--text-strong);font-size:12px">
          <button class="btn sec sm" id="sgd-incl-all">Include all</button>
          <button class="btn sec sm" id="sgd-incl-none">Exclude all</button>
          <button class="btn sec sm" id="sgd-incl-invert" title="Flip every visible site's inclusion state">Invert</button>
        </div>
        <div id="sgd-incl-list" style="max-height:55vh;overflow-y:auto;padding-right:6px">${rows}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--border);gap:12px">
          <span style="font-size:11.5px;color:var(--text-faint)" id="sgd-incl-count">${initIncluded} of ${sites.length} included</span>
          <div style="display:flex;gap:6px">
            <button class="btn sec sm" id="sgd-incl-reset" title="Re-include every site (clear all exclusions)">Reset</button>
            <button class="btn" id="sgd-incl-apply">Apply</button>
          </div>
        </div>
      </div>`;
        document.body.appendChild(overlay);
        const list = overlay.querySelector('#sgd-incl-list');
        const countEl = overlay.querySelector('#sgd-incl-count');
        const updateCount = () => {
            const inc = list.querySelectorAll('input:checked').length;
            const tot = list.querySelectorAll('input').length;
            countEl.textContent = `${inc} of ${tot} included`;
        }
        ;
        list.addEventListener('change', updateCount);
        const applyToVisible = fn => {
            list.querySelectorAll('input').forEach(c => {
                if (c.disabled)
                    return;
                if (c.closest('.cust-row').style.display === 'none')
                    return;
                fn(c);
            }
            );
            updateCount();
        }
        ;
        overlay.querySelector('#sgd-incl-all').addEventListener('click', () => applyToVisible(c => c.checked = true));
        overlay.querySelector('#sgd-incl-none').addEventListener('click', () => applyToVisible(c => c.checked = false));
        overlay.querySelector('#sgd-incl-invert').addEventListener('click', () => applyToVisible(c => c.checked = !c.checked));
        overlay.querySelector('#sgd-incl-reset').addEventListener('click', () => {
            list.querySelectorAll('input').forEach(c => {
                if (!c.disabled)
                    c.checked = true;
            }
            );
            updateCount();
        }
        );
        overlay.querySelector('#sgd-incl-search').addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            list.querySelectorAll('.cust-row').forEach(r => {
                r.style.display = r.querySelector('.cust-nm').textContent.toLowerCase().includes(q) ? '' : 'none';
            }
            );
        }
        );
        const close = () => overlay.remove();
        overlay.querySelector('#sgd-incl-cancel').addEventListener('click', close);
        overlay.addEventListener('click', e => {
            if (e.target === overlay)
                close();
        }
        );
        overlay.querySelector('#sgd-incl-apply').addEventListener('click', () => {
            // Rebuild excludedSites from the unchecked-and-not-disabled boxes.
            const next = new Set();
            list.querySelectorAll('input').forEach(c => {
                if (!c.checked && !c.disabled)
                    next.add(c.dataset.d);
            }
            );
            S.ui.excludedSites = next;
            persistExcluded();
            // Re-derive isExcluded on cached siteStats so every renderer honours the update.
            if (S.data)
                S.data.siteStats.forEach(s => s.isExcluded = isExcluded(s.domain));
            // Refresh the persistent header chip in place.
            const chip = document.getElementById('sgd-excl-chip');
            if (chip) {
                chip.classList.toggle('has', S.ui.excludedSites.size > 0);
                const c = chip.querySelector('#sgd-excl-count');
                if (c)
                    c.textContent = S.ui.excludedSites.size;
            }
            close();
            onApply?.();
        }
        );
    }
    ;

    // Per-site ranking on an arbitrary metric extracted from perSiteRaw. Used by the
    // Fix Focus hero to rank "most-improved on cost-per-exec" or "most-decreased on
    // execution volume" without rebuilding the per-site loop. Drops sites with
    // null/zero baseline on the chosen metric and any NEW/DIED/INACTIVE/excluded peers
    // (target is always kept).
    const rankByMetric = (perSiteRaw, getCh, target) => {
        return perSiteRaw
            .filter(r => {
                if (['NEW', 'DIED', 'INACTIVE'].includes(r.activityClass))
                    return false;
                if (!r.isTarget && isExcluded(r.domain))
                    return false;
                const v = getCh(r);
                return v !== null && isFinite(v);
            }
            )
            .map(r => ({ ...r, metricCh: getCh(r) }))
            .sort( (a, b) => a.metricCh - b.metricCh);
    }
    ;

    // Render the Fix Focus hero — a single, prominent card at the top of Before/After
    // that tells the user the one number that matters for the fix they're trying to
    // demonstrate. Returns '' when fixFocus is 'auto' (original full layout takes over).
    //
    // Each focus picks: (a) the headline metric, (b) the appropriate DiD vs peers/network,
    // (c) a tailored verdict, (d) where applicable, a mini ranking of similar sites.
    // Memory + Cores are server-wide-only (SG API limitation) so those heroes lean on
    // correlation with the target's CPU share rather than a per-site DiD.
    const renderFocusHero = (cmp, focus, target, data, ctrlDoms, ctrlLabel) => {
        if (focus === 'auto')
            return '';
        const site = target.split('.')[0];
        const ctrlSize = ctrlDoms.length;
        const netSize = cmp.networkDoms.length;
        // The verdict is graded against the SELECTED group (baseline). Whole-network is context.
        // When the selected group IS the whole network, the two coincide and we say "the network".
        const baseIsNet = !!cmp.ctrlIsNetwork;
        const baseName = baseIsNet ? 'the network' : 'your selected peers';
        const baseUnit = baseIsNet ? 'vs network' : 'vs selected peers';
        const baseBadge = ' <span style="background:var(--accent);color:#fff;font-size:8px;font-weight:700;padding:1px 6px;border-radius:8px;text-transform:uppercase;letter-spacing:.04em;vertical-align:middle">baseline</span>';
        const ctxBadge = ' <span style="color:var(--text-ghost);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">context</span>';
        const refCh = L => baseIsNet ? L.netCh : L.ctrlCh;
        const ctrlLbl = `${esc(ctrlLabel)} (${ctrlSize} site${ctrlSize === 1 ? '' : 's'})${baseIsNet ? '' : baseBadge}`;
        const netLbl = `Whole network (${netSize} site${netSize === 1 ? '' : 's'})${baseIsNet ? baseBadge : ctxBadge}`;
        const tgtLbl = `Target — ${esc(site)}`;
        // Common row builder: label + "before → after" pair + change %, with colour class.
        const row = (label, before, after, ch, fmtFn, unit) => {
            const arrow = ch === null ? '→' : ch < 0 ? '↓' : ch > 0 ? '↑' : '→';
            const bStr = before === null || before === undefined ? '—' : fmtFn(before);
            const aStr = after === null || after === undefined ? '—' : fmtFn(after);
            return `<div class="fh-row">
        <div class="fh-row-lbl">${label}</div>
        <div class="fh-row-vals">
          <span class="fh-row-pair">${bStr} → ${aStr}${unit ? ` <span style="color:var(--text-faint);font-size:10px">${esc(unit)}</span>` : ''}</span>
          <span class="fh-row-ch ${clsCh(ch)}">${arrow} ${ch === null ? '—' : signStr(ch)}</span>
        </div>
      </div>`;
        }
        ;
        // DiD-style verdict given target's change and a reference change (typically network)
        const verdict = (tCh, refCh, refName, goal) => {
            if (tCh === null || refCh === null)
                return { cls: 'cn', heroLbl: '—', text: 'Insufficient data for peer comparison.' };
            const did = tCh - refCh;
            const cls = did <= -10 ? 'cg' : did >= 10 ? 'cr' : Math.abs(did) > 3 ? 'cw2' : 'cn';
            const heroLbl = `${did > 0 ? '+' : ''}${did.toFixed(1)} pp`;
            let text;
            if (did <= -15)
                text = `✅ <strong>Target beat ${refName} by ${Math.abs(did).toFixed(0)} pp.</strong> The fix has a clearly isolated effect on ${esc(goal)} — peers were not seeing the same improvement.`;
            else if (did < -5)
                text = `⚠️ Modest peer-relative win on ${esc(goal)}: ${did.toFixed(1)} pp better than ${refName}. Some of the gain is real, but a meaningful share could be ambient.`;
            else if (Math.abs(did) <= 5)
                text = `🔴 Target moved with ${refName} (target ${signStr(tCh)} vs ${refName} ${signStr(refCh)}). ${esc(goal)} changed similarly everywhere — the fix can't be credited with the isolated improvement.`;
            else
                text = `🔴 Target <em>underperformed</em> ${refName} by ${did.toFixed(0)} pp on ${esc(goal)}. Investigate — the fix may have regressed this axis relative to peers.`;
            return { cls, heroLbl, text };
        }
        ;
        // Mini per-site ranking strip for the chosen metric. Renders the top-3 movers
        // (most-improved) plus the target's position. Helps the user see whether target
        // is genuinely an outlier or just part of an account-wide trend.
        const miniRank = (ranked, fmtFn, unit) => {
            if (!ranked.length)
                return '';
            const targetIdx = ranked.findIndex(r => r.isTarget);
            const tot = ranked.length;
            const topN = ranked.slice(0, 3);
            const items = topN.map( (r, i) => `<li>${r.isTarget ? '<strong style="color:var(--accent)">' : ''}#${i + 1} ${esc(r.domain)}${r.isTarget ? '</strong>' : ''} <span class="fh-mini-ch ${clsCh(r.metricCh)}">${signStr(r.metricCh)}</span></li>`).join('');
            const targetBit = targetIdx >= 3 ? `<li class="fh-mini-tgt">… #${targetIdx + 1} of ${tot}: <strong>${esc(site)}</strong> <span class="fh-mini-ch ${clsCh(ranked[targetIdx].metricCh)}">${signStr(ranked[targetIdx].metricCh)}</span></li>` : (targetIdx < 0 ? `<li class="fh-mini-tgt">target unranked (insufficient baseline)</li>` : '');
            return `<div class="fh-mini-rank">
        <div class="fh-mini-h">Most-improved peers on this metric (${tot} sites ranked)</div>
        <ol class="fh-mini-list">${items}${targetBit}</ol>
      </div>`;
        }
        ;
        // Build the focus-specific content.
        if (focus === 'cost') {
            if (!data.hasExec)
                return `<div class="focus-hero noop"><strong>Fix Focus: Cost per execution</strong> — execution data isn't available for this account, so per-request cost can't be measured. Switch Fix Focus back to <em>Show everything</em> or pick a different metric.</div>`;
            const L = cmp.lenses.perExec;
            const v = verdict(L.tgtCh, refCh(L), baseName, 'per-request cost');
            const ranked = rankByMetric(cmp.perSiteRaw, r => r.costCh, target);
            return `<div class="focus-hero" data-focus="cost">
        <div class="fh-head">
          <div class="fh-h-l"><span class="fh-eyebrow">FIX FOCUS — cost per execution</span><h3 class="fh-title">Did each request get cheaper?</h3></div>
          <div class="fh-hero-num ${v.cls}">${v.heroLbl}<span class="fh-hero-unit">${baseUnit}</span></div>
        </div>
        <div class="fh-body">
          ${row(tgtLbl, L.tgtBefore, L.tgtAfter, L.tgtCh, v => fmtD(v, 3), 'sec/req')}
          ${ctrlLbl !== netLbl ? row(ctrlLbl, L.ctrlBefore, L.ctrlAfter, L.ctrlCh, v => fmtD(v, 3), 'sec/req') : ''}
          ${row(netLbl, L.netBefore, L.netAfter, L.netCh, v => fmtD(v, 3), 'sec/req')}
        </div>
        <div class="fh-verdict ${v.cls}">${v.text}</div>
        ${miniRank(ranked, v => fmtD(v, 3), 'sec/req')}
      </div>`;
        }
        if (focus === 'execs') {
            if (!data.hasExec)
                return `<div class="focus-hero noop"><strong>Fix Focus: Execution volume</strong> — execution data isn't available for this account. Switch to a different focus or back to <em>Show everything</em>.</div>`;
            const L = cmp.lenses.exec;
            const v = verdict(L.tgtCh, refCh(L), baseName, 'request volume');
            const ranked = rankByMetric(cmp.perSiteRaw, r => r.exCh, target);
            return `<div class="focus-hero" data-focus="execs">
        <div class="fh-head">
          <div class="fh-h-l"><span class="fh-eyebrow">FIX FOCUS — execution volume</span><h3 class="fh-title">Did request volume actually drop?</h3></div>
          <div class="fh-hero-num ${v.cls}">${v.heroLbl}<span class="fh-hero-unit">${baseUnit}</span></div>
        </div>
        <div class="fh-body">
          ${row(tgtLbl, L.tgtBefore, L.tgtAfter, L.tgtCh, fmtN, 'requests/day')}
          ${ctrlLbl !== netLbl ? row(ctrlLbl, L.ctrlBefore, L.ctrlAfter, L.ctrlCh, fmtN, 'requests/day') : ''}
          ${row(netLbl, L.netBefore, L.netAfter, L.netCh, fmtN, 'requests/day')}
        </div>
        <div class="fh-verdict ${v.cls}">${v.text}</div>
        ${miniRank(ranked, fmtN, 'requests/day')}
      </div>`;
        }
        if (focus === 'cpu') {
            const L = cmp.lenses.cpu;
            const v = verdict(L.tgtCh, refCh(L), baseName, 'CPU consumption');
            const ranked = rankByMetric(cmp.perSiteRaw, r => r.pctCh, target);
            const counterBit = (cmp.savedCpuPerDay !== null && cmp.expectedAfter !== null) ? `<div class="fh-counter">Counterfactual: had the target drifted with ${baseName}, after-CPU would sit at <strong>${fmtN(cmp.expectedAfter)}</strong>; actual is <strong>${fmtN(cmp.tAvgA)}</strong> — a net <strong class="${cmp.savedCpuPerDay >= 0 ? 'cg' : 'cr'}">${cmp.savedCpuPerDay >= 0 ? 'saving' : 'loss'} of ${fmtN(Math.abs(cmp.savedCpuPerDay))}</strong> CPU sec/day.</div>` : '';
            return `<div class="focus-hero" data-focus="cpu">
        <div class="fh-head">
          <div class="fh-h-l"><span class="fh-eyebrow">FIX FOCUS — CPU seconds</span><h3 class="fh-title">Did total CPU time actually fall?</h3></div>
          <div class="fh-hero-num ${v.cls}">${v.heroLbl}<span class="fh-hero-unit">${baseUnit}</span></div>
        </div>
        <div class="fh-body">
          ${row(tgtLbl, L.tgtBefore, L.tgtAfter, L.tgtCh, fmtN, 'CPU sec/day')}
          ${ctrlLbl !== netLbl ? row(ctrlLbl, L.ctrlBefore, L.ctrlAfter, L.ctrlCh, fmtN, 'CPU sec/day') : ''}
          ${row(netLbl, L.netBefore, L.netAfter, L.netCh, fmtN, 'CPU sec/day')}
        </div>
        <div class="fh-verdict ${v.cls}">${v.text}</div>
        ${counterBit}
        ${miniRank(ranked, fmtN, 'CPU sec/day')}
      </div>`;
        }
        if (focus === 'memory') {
            if (!data.hasMem)
                return `<div class="focus-hero noop"><strong>Fix Focus: Memory used</strong> — memory data isn't available for this account.</div>`;
            const mbAvg = avgAll(cmp.mB), maAvg = avgAll(cmp.mA);
            const memCh = pctCh(mbAvg, maAvg);
            // Account-wide memory only — SG doesn't report per-site. We surface correlation
            // with target's CPU share so the user can argue "my fix reduced the dominant CPU
            // consumer → memory followed". Not a DiD; a narrative correlation.
            const shareBefore = cmp.tAvgB && avgAll(cmp.aB) ? cmp.tAvgB / avgAll(cmp.aB) * 100 : null;
            const shareAfter = cmp.tAvgA && avgAll(cmp.aA) ? cmp.tAvgA / avgAll(cmp.aA) * 100 : null;
            const shareCh = pctCh(shareBefore, shareAfter);
            const cls = memCh === null ? 'cn' : memCh <= -10 ? 'cg' : memCh <= -3 ? 'cw2' : memCh >= 5 ? 'cr' : 'cn';
            const heroLbl = memCh === null ? '—' : `${memCh > 0 ? '+' : ''}${memCh.toFixed(1)}%`;
            let text;
            if (memCh === null)
                text = 'Insufficient memory data over the window.';
            else if (memCh <= -10 && shareCh !== null && shareCh < -5)
                text = `✅ <strong>Account memory dropped ${Math.abs(memCh).toFixed(0)}%</strong> while ${esc(site)}'s CPU share fell from ${fmtD(shareBefore, 1)}% to ${fmtD(shareAfter, 1)}%. The two move together — strong signal the fix freed the memory.`;
            else if (memCh <= -10)
                text = `✅ Account memory dropped ${Math.abs(memCh).toFixed(0)}%, but target's CPU share moved by ${signStr(shareCh)} — the drop may have come from a different site. Cross-check the All-Sites Ranking below.`;
            else if (memCh < -3)
                text = `⚠️ Modest memory decrease (${memCh.toFixed(0)}%). Per-site memory isn't reported by SiteGround, so attribution to the target requires looking at which site's CPU dropped most.`;
            else if (Math.abs(memCh) <= 3)
                text = `→ Memory essentially unchanged (${signStr(memCh)}). If the fix targeted memory specifically, it didn't show up at the server level — could mean the fix worked but memory is dominated by a different site.`;
            else
                text = `🔴 Memory <em>rose</em> ${memCh.toFixed(0)}% over the window. Investigate.`;
            return `<div class="focus-hero" data-focus="memory">
        <div class="fh-head">
          <div class="fh-h-l"><span class="fh-eyebrow">FIX FOCUS — memory used</span><h3 class="fh-title">Did memory pressure drop?</h3></div>
          <div class="fh-hero-num ${cls}">${heroLbl}<span class="fh-hero-unit">account avg</span></div>
        </div>
        <div class="fh-body">
          ${row('Account peak memory', mbAvg, maAvg, memCh, v => fmtD(v, 2), 'GB avg/day')}
          ${row(`Target CPU share`, shareBefore, shareAfter, shareCh, v => fmtD(v, 2), '%')}
        </div>
        <div class="fh-note">⚠️ <strong>SiteGround does not report per-site memory.</strong> Comparison is account-wide; per-site attribution requires correlating with each site's CPU share movement.</div>
        <div class="fh-verdict ${cls}">${text}</div>
      </div>`;
        }
        if (focus === 'cores') {
            const kbAvg = avgAll(cmp.kB), kaAvg = avgAll(cmp.kA);
            const corCh = pctCh(kbAvg, kaAvg);
            const corLimit = data.currentCoreLimit;
            const shareBefore = cmp.tAvgB && avgAll(cmp.aB) ? cmp.tAvgB / avgAll(cmp.aB) * 100 : null;
            const shareAfter = cmp.tAvgA && avgAll(cmp.aA) ? cmp.tAvgA / avgAll(cmp.aA) * 100 : null;
            const shareCh = pctCh(shareBefore, shareAfter);
            const peakBefore = Math.max(0, ...cmp.kB, 0), peakAfter = Math.max(0, ...cmp.kA, 0);
            const peakCh = pctCh(peakBefore, peakAfter);
            const cls = corCh === null ? 'cn' : corCh <= -10 ? 'cg' : corCh <= -3 ? 'cw2' : corCh >= 5 ? 'cr' : 'cn';
            const heroLbl = corCh === null ? '—' : `${corCh > 0 ? '+' : ''}${corCh.toFixed(1)}%`;
            let text;
            if (corCh === null)
                text = 'Insufficient cores-in-use data over the window.';
            else if (corCh <= -10 && shareCh !== null && shareCh < -5)
                text = `✅ <strong>Cores in use dropped ${Math.abs(corCh).toFixed(0)}%</strong> while ${esc(site)}'s CPU share fell from ${fmtD(shareBefore, 1)}% to ${fmtD(shareAfter, 1)}%. Correlation strongly suggests the fix released the cores.`;
            else if (corCh <= -10)
                text = `✅ Cores in use dropped ${Math.abs(corCh).toFixed(0)}%, but target's CPU share moved by ${signStr(shareCh)} — the relief may have come from a different site.`;
            else if (corCh < -3)
                text = `⚠️ Modest cores-in-use decrease (${corCh.toFixed(0)}%). For a more sensitive read, check whether peak cores fell — peak relief matters more than average for capacity headroom.`;
            else if (Math.abs(corCh) <= 3)
                text = `→ Cores in use essentially unchanged (${signStr(corCh)}). The fix did not reduce average concurrent load at the server level.`;
            else
                text = `🔴 Cores in use <em>rose</em> ${corCh.toFixed(0)}% — capacity headroom shrank during this window.`;
            return `<div class="focus-hero" data-focus="cores">
        <div class="fh-head">
          <div class="fh-h-l"><span class="fh-eyebrow">FIX FOCUS — server cores in use</span><h3 class="fh-title">Did concurrent server load drop?</h3></div>
          <div class="fh-hero-num ${cls}">${heroLbl}<span class="fh-hero-unit">account avg</span></div>
        </div>
        <div class="fh-body">
          ${row('Avg cores in use', kbAvg, kaAvg, corCh, v => fmtD(v, 2), `of ${corLimit}`)}
          ${row('Peak cores in use', peakBefore, peakAfter, peakCh, v => fmtD(v, 2), `of ${corLimit}`)}
          ${row(`Target CPU share`, shareBefore, shareAfter, shareCh, v => fmtD(v, 2), '%')}
        </div>
        <div class="fh-note">⚠️ <strong>Cores in use are server-wide.</strong> SiteGround doesn't report per-site cores, so attribution requires correlating with each site's CPU share movement.</div>
        <div class="fh-verdict ${cls}">${text}</div>
      </div>`;
        }
        if (focus === 'combo') {
            // Multi-metric scorecard — one row per metric, DiD vs network where the metric
            // supports per-site comparison (cost/execs/cpu) or noted as server-wide for
            // memory and cores. Gives a single-glance verdict across all axes.
            const Lc = cmp.lenses.cpu, Le = cmp.lenses.exec, Lp = cmp.lenses.perExec;
            const mbAvg = avgAll(cmp.mB), maAvg = avgAll(cmp.mA), memCh = pctCh(mbAvg, maAvg);
            const kbAvg = avgAll(cmp.kB), kaAvg = avgAll(cmp.kA), corCh = pctCh(kbAvg, kaAvg);
            const scoreRow = (label, tCh, refCh, ext) => {
                const did = (tCh !== null && refCh !== null) ? tCh - refCh : null;
                const cls = did === null ? 'cn' : did <= -10 ? 'cg' : did >= 10 ? 'cr' : Math.abs(did) > 3 ? 'cw2' : 'cn';
                const didLbl = did === null ? '—' : `${did > 0 ? '+' : ''}${did.toFixed(1)} pp`;
                const tLbl = tCh === null ? '—' : signStr(tCh);
                const rLbl = refCh === null ? '—' : signStr(refCh);
                return `<tr><td>${esc(label)}</td><td class="r ${clsCh(tCh)}">${tLbl}</td><td class="r ${clsCh(refCh)}">${rLbl}</td><td class="r ${cls}"><strong>${didLbl}</strong></td><td class="combo-ext">${ext}</td></tr>`;
            }
            ;
            const serverRow = (label, before, after, ch, fmtFn, unit) => {
                const cls = ch === null ? 'cn' : ch <= -10 ? 'cg' : ch >= 5 ? 'cr' : Math.abs(ch) > 3 ? 'cw2' : 'cn';
                return `<tr class="combo-server"><td>${esc(label)} <span style="color:var(--text-faint);font-size:10px">server-wide</span></td><td class="r ${cls}">${ch === null ? '—' : signStr(ch)}</td><td class="r cd">—</td><td class="r cd">—</td><td class="combo-ext">${before === null ? '—' : fmtFn(before)} → ${after === null ? '—' : fmtFn(after)} ${unit}</td></tr>`;
            }
            ;
            return `<div class="focus-hero" data-focus="combo">
        <div class="fh-head">
          <div class="fh-h-l"><span class="fh-eyebrow">FIX FOCUS — combination</span><h3 class="fh-title">Multi-metric scorecard</h3></div>
        </div>
        <div class="fh-body">
          <table class="combo-tbl"><thead><tr><th>Metric</th><th class="r">Target</th><th class="r">Network</th><th class="r">Net (DiD)</th><th>Detail</th></tr></thead>
          <tbody>
            ${data.hasExec ? scoreRow('Cost per execution', Lp.tgtCh, Lp.netCh, `${Lp.tgtBefore === null ? '—' : fmtD(Lp.tgtBefore, 3)} → ${Lp.tgtAfter === null ? '—' : fmtD(Lp.tgtAfter, 3)} sec/req`) : ''}
            ${data.hasExec ? scoreRow('Execution volume', Le.tgtCh, Le.netCh, `${fmtN(Le.tgtBefore)} → ${fmtN(Le.tgtAfter)} req/day`) : ''}
            ${scoreRow('CPU seconds', Lc.tgtCh, Lc.netCh, `${fmtN(Lc.tgtBefore)} → ${fmtN(Lc.tgtAfter)} CPU sec/day`)}
            ${data.hasMem ? serverRow('Account memory', mbAvg, maAvg, memCh, v => fmtD(v, 2), 'GB') : ''}
            ${serverRow('Cores in use', kbAvg, kaAvg, corCh, v => fmtD(v, 2), `of ${data.currentCoreLimit}`)}
          </tbody></table>
        </div>
        <div class="fh-note">Each per-site row compares target's % change to the whole network's % change. Server-wide rows show account-level movement (per-site not reported by SiteGround). Net column is target − network in percentage points; negative is a peer-relative win.</div>
      </div>`;
        }
        return '';
    }
    ;

    const renderCmpOut = data => {
        const out = document.getElementById('cmp-out');
        if (!out)
            return;
        const target = document.getElementById('cmp-tgt')?.value || S.ui.target;
        const fixDate = document.getElementById('cmp-fix')?.value || S.ui.fixDate;
        const daysBefore = +(document.getElementById('cmp-before')?.value || S.ui.daysBefore);
        const daysAfter = +(document.getElementById('cmp-after')?.value || S.ui.daysAfter);
        const ctrlPreset = document.getElementById('cmp-ctrl')?.value || S.ui.ctrlPreset;
        const fixFocus = document.getElementById('cmp-focus')?.value || S.ui.fixFocus || 'auto';
        const weekdaysOnly = !!document.getElementById('cmp-weekdays')?.checked;
        const minActivityCpu = +(document.getElementById('cmp-minact')?.value || 0);
        const useCustom = !!S.ui.useCustomDates;
        const cBefStart = document.getElementById('cmp-bstart')?.value || null;
        const cAftEnd = document.getElementById('cmp-aend')?.value || null;
        // When using custom date ranges, derive the window from the explicit dates rather
        // than ±N days. Before-end is the day before the fix; after-start is the fix date.
        const buildOpts = {
            weekdaysOnly,
            minActivityCpu
        };
        if (useCustom && cBefStart)
            buildOpts.bStart = cBefStart;
        if (useCustom && cBefStart)
            buildOpts.bEnd = addDays(fixDate, -1);
        if (useCustom && cAftEnd)
            buildOpts.aStart = fixDate;
        if (useCustom && cAftEnd)
            buildOpts.aEnd = cAftEnd;
        // Detect whether key inputs changed since last run; if so, recompute the frozen control.
        const inputsKey = `${target}|${fixDate}|${ctrlPreset}|${useCustom ? cBefStart + ':' + cAftEnd : daysBefore + ':' + daysAfter}|${weekdaysOnly}|${minActivityCpu}`;
        const inputsChanged = S.ui.ctrlInputsKey !== inputsKey;
        Object.assign(S.ui, {
            target,
            fixDate,
            daysBefore,
            daysAfter,
            ctrlPreset,
            fixFocus,
            weekdaysOnly,
            minActivityCpu,
            customBeforeStart: useCustom ? cBefStart : S.ui.customBeforeStart,
            customAfterEnd: useCustom ? cAftEnd : S.ui.customAfterEnd,
            ctrlInputsKey: inputsKey
        });
        let ctrlDoms;
        if (ctrlPreset === 'auto') {
            if (inputsChanged || !S.ui.frozenCtrl || !S.ui.frozenCtrl.length) {
                S.ui.frozenCtrl = resolveCtrl(data, target, ctrlPreset);
            }
            ctrlDoms = S.ui.frozenCtrl;
        } else {
            ctrlDoms = resolveCtrl(data, target, ctrlPreset);
            S.ui.frozenCtrl = null;
        }
        const cmp = buildCmp(data, target, fixDate, daysBefore, daysAfter, ctrlDoms, buildOpts);
        const interp = interpret(cmp, target, fixFocus, data);
        const h = buildHourlyData();
        const tSite = data.siteStats.find(s => s.domain === target);
        const curHrCpu = h ? lastCompleteHourly(h.sites.find(x => x.domain === target)?.points) : null;
        const avgBefore = avgAll(cmp.tB)
          , avgAfter = avgAll(cmp.tA);
        const curVsBefore = curHrCpu !== null && avgBefore > 0 ? ((curHrCpu * 24 / avgBefore) - 1) * 100 : null;
        const liveCore = getLiveCore();

        const liveCores = getLiveCores();
        const coreLim = getCoreLimit();
        const corePlanPct = (liveCores !== null && coreLim) ? liveCores / coreLim : null;
        const curStatHtml = `<div class="cur-status">
    <div class="cur-stat" ${tipAttr('core_pct')}><div class="cur-stat-t">Live Server Cores</div>
      <div class="cur-stat-v ${corePlanPct !== null ? (corePlanPct > 0.75 ? 'cr' : corePlanPct > 0.5 ? 'cw2' : 'cg') : 'cd'}">${liveCores !== null ? `${liveCores.toFixed(2)} / ${coreLim}` : '—'}</div>
      <div class="cur-stat-s">30d avg: ${fmtD(data.benchmarks.core.avg30, 2)} cores${corePlanPct !== null ? ` · now ${(corePlanPct * 100).toFixed(0)}% of plan` : ''}</div>
    </div>
    <div class="cur-stat" ${tipAttr('cpu_seconds')}><div class="cur-stat-t">Target Last Hr</div>
      <div class="cur-stat-v ${curHrCpu !== null ? 'cn' : 'cd'}">${curHrCpu !== null ? fmtN(curHrCpu) : '—'}</div>
      <div class="cur-stat-s">${curVsBefore !== null ? `vs before avg: <span class="${clsCh(curVsBefore)}">${signStr(curVsBefore)}</span> annualised` : 'Hourly data unavailable'}</div>
    </div>
    <div class="cur-stat" ${tipAttr('trend7')}><div class="cur-stat-t">7d Trend</div>
      <div class="cur-stat-v ${clsCh(tSite?.trend7 || null)}">${tSite?.trend7 !== null ? signStr(tSite.trend7) : '—'}</div>
      <div class="cur-stat-s">Week-on-week CPU change</div>
    </div>
    <div class="cur-stat" ${tipAttr('cpu_seconds')}><div class="cur-stat-t">Before Avg/Day</div>
      <div class="cur-stat-v">${fmtN(avgBefore)}</div>
      <div class="cur-stat-s">${cmp.bDates.length} complete days</div>
    </div>
    <div class="cur-stat" ${tipAttr('cpu_seconds')}><div class="cur-stat-t">After Avg/Day</div>
      <div class="cur-stat-v ${clsCh(pctCh(avgBefore, avgAfter))}">${fmtN(avgAfter)}</div>
      <div class="cur-stat-s">${signStr(pctCh(avgBefore, avgAfter))} · ${cmp.aDates.length} days</div>
    </div>
    <div class="cur-stat" ${tipAttr('target_share')}><div class="cur-stat-t">Current Share</div>
      <div class="cur-stat-v">${tSite ? fmtD(tSite.shareOfAccount) + '%' : '—'}</div>
      <div class="cur-stat-s">% of server CPU (30d)</div>
    </div>
  </div>`;

        // Lead the metric cards with the keys that match the active Fix Focus, so the card the
        // reader scans first is the one the report is about. Remaining cards keep their order.
        const focusCardKeys = ({
            cost: ['cpu_ex'], execs: ['ex_avg'], cpu: ['cpu_avg', 'cpu_tot'],
            memory: ['mem_avg', 'mem_peak'], cores: ['core'],
            combo: ['cpu_ex', 'ex_avg', 'cpu_avg', 'mem_avg', 'core']
        })[fixFocus] || [];
        const orderedMetrics = focusCardKeys.length
            ? [...focusCardKeys.map(k => cmp.metrics.find(m => m.key === k)).filter(Boolean),
               ...cmp.metrics.filter(m => !focusCardKeys.includes(m.key))]
            : cmp.metrics;
        const cards = orderedMetrics.map(m => {
            const ch = pctCh(m.before, m.after);
            const cls = m.neutral ? 'cn' : clsCh(ch);
            const lead = focusCardKeys.includes(m.key) ? ' style="border-top:var(--accent-bar)"' : '';
            return `<div class="cmp-card"${lead} ${tipAttr(m.tip)}><div class="cmp-t">${tipIcon(m.tip)} ${esc(m.title)}</div><div class="cmp-v ${cls}">${signStr(ch)}</div><div class="cmp-d">${m.fmt(m.before)} → ${m.fmt(m.after)} ${m.unit}</div><div class="cmp-desc">${esc(m.desc)}</div></div>`;
        }
        );

        // ctrlLabel is consumed by both the Net Effect hero IIFE (immediately below) and the
        // Three-Lens rows further down. The hero IIFE self-invokes, so ctrlLabel MUST be declared
        // before it — otherwise it's in the temporal dead zone when the IIFE runs and the entire
        // Before/After render throws "Cannot access 'ctrlLabel' before initialization".
        const ctrlLabel = ({
            auto: 'Auto Top 5', top3: 'Top 3', top10: 'Top 10',
            smallest5: 'Smallest 5', network: 'Whole Network',
            cobble: 'Cobblestone domains', unpatched: 'Unpatched',
            lms_core: 'LMS Core 4', non_lms: 'Non-LMS', custom: 'Custom'
        })[ctrlPreset] || 'Selected';
        // ── Net Effect hero card (Difference-in-Differences) ─────────────────
        // Graded against the SELECTED comparison group (baseline). Whole-network shown as a
        // context line in the footer when the selected group is a curated subset.
        const neHtml = ( () => {
            const baseIsNet = !!cmp.ctrlIsNetwork;
            const baseTitle = baseIsNet ? 'Network' : esc(ctrlLabel);
            const ne = cmp.netEffectPct;
            const tc = cmp.targetPctCh;
            const nc = cmp.baselinePctCh;
            const saved = cmp.savedCpuPerDay;
            const expected = cmp.expectedAfter;
            const heroCls = ne === null ? 'cn' : ne <= -10 ? 'cg' : ne >= 10 ? 'cr' : Math.abs(ne) > 3 ? 'cw2' : 'cn';
            const heroLbl = ne === null ? '—' : `${ne > 0 ? '+' : ''}${ne.toFixed(1)} pp`;
            const peerWord = baseIsNet ? 'the network' : 'your selected peers';
            const verdict = ne === null ? 'Insufficient data' : ne <= -15 ? '✅ Strong isolated fix effect' : ne < -5 ? '⚠️ Modest isolated effect' : Math.abs(ne) <= 5 ? `🔴 Target moved with ${peerWord} — no isolated effect` : ne > 5 ? `🔴 Target underperformed ${peerWord}` : '';
            const rankBit = (cmp.targetPercentile !== null && cmp.targetRank > 0) ? `Site rank <strong>#${cmp.targetRank}/${cmp.perSite.length}</strong> (improved more than ${cmp.targetPercentile.toFixed(0)}% of sites). ` : '';
            const counterBit = (saved !== null && expected !== null) ? `Counterfactual: had the target drifted with ${peerWord}, after-CPU would sit at <strong>${fmtN(expected)}</strong>; actual is <strong>${fmtN(cmp.tAvgA)}</strong> — a net <strong class="${saved >= 0 ? 'cg' : 'cr'}">${saved >= 0 ? 'saving' : 'loss'} of ${fmtN(Math.abs(saved))}</strong> CPU sec/day vs that counterfactual.` : '';
            // Whole-network context line — only meaningful when the baseline is a curated subset.
            const netCtxBit = !baseIsNet ? `<br>Whole-network context (${cmp.networkDoms.length} sites): <strong>${fmtN(cmp.nAvgB)} → ${fmtN(cmp.nAvgA)}</strong> (<span class="${clsCh(cmp.networkPctCh)}">${signStr(cmp.networkPctCh)}</span>); net effect vs network <strong>${cmp.netEffectPctVsNetwork === null ? '—' : (cmp.netEffectPctVsNetwork > 0 ? '+' : '') + cmp.netEffectPctVsNetwork.toFixed(1) + ' pp'}</strong>.` : '';
            return `<div class="net-hero">
      <div class="nh-row"><div class="nh-lbl">${tipIcon('net_effect')} Net Effect (vs ${baseIsNet ? 'Network' : 'Selected Peers'})</div>
        <div class="nh-big ${heroCls}">${heroLbl}</div>
        <div class="nh-sub">${verdict}</div>
        ${laymanSub('net_effect')}
      </div>
      <div class="nh-row"><div class="nh-lbl">${tipIcon('cpu_seconds')} Target Change</div>
        <div class="nh-pair"><span class="nh-num">${fmtN(cmp.tAvgB)} → ${fmtN(cmp.tAvgA)}</span></div>
        <div class="nh-mini"><span class="${clsCh(tc)}">${signStr(tc)}</span> · avg CPU sec/day</div>
      </div>
      <div class="nh-row"><div class="nh-lbl">${tipIcon('network_change')} ${baseTitle} Change <span style="color:var(--text-ghost);font-weight:600">(${cmp.ctrlDoms.length} site${cmp.ctrlDoms.length === 1 ? '' : 's'})${baseIsNet ? '' : ' · baseline'}</span></div>
        <div class="nh-pair"><span class="nh-num">${fmtN(cmp.cAvgB)} → ${fmtN(cmp.cAvgA)}</span></div>
        <div class="nh-mini"><span class="${clsCh(nc)}">${signStr(nc)}</span> · combined CPU sec/day</div>
      </div>
      <div class="nh-foot">${rankBit}${counterBit}${netCtxBit}</div>
    </div>`;
        }
        )();

        // ── Credibility + Plan-change banner ────────────────────────────────
        const credHtml = ( () => {
            const c = cmp.credibility;
            if (!c)
                return '';
            const cls = c.score >= 75 ? 'cred-hi' : c.score >= 50 ? 'cred-mid' : 'cred-lo';
            const planBit = cmp.planStraddles.length ? `<div class="cred-plan" style="background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)">ℹ️ <strong>Plan upgraded during this window:</strong> ${cmp.planStraddles.map(p => `${p.kind} ${p.fromVal}→${p.toVal} on <strong>${p.date}</strong>`).join('; ')}. Every metric (CPU sec, cores used, GB, executions, DiD/Welch) is in <strong>absolute units</strong> — plan-immune, comparable across the upgrade.</div>` : '';
            const reasonsBit = c.reasons.length ? `<div class="cred-reasons">${c.reasons.map(r => `<span class="cred-reason">${esc(r)}</span>`).join('')}</div>` : '';
            return `<div class="cred-card ${cls}">
      <div class="cred-meter">
        <div class="cred-meter-lbl">${tipIcon('credibility')} Credibility</div>
        <div class="cred-meter-bar"><div class="cred-meter-fill" style="width:${c.score}%"></div></div>
        <div class="cred-meter-num">${c.score}<span style="font-size:13px;font-weight:600;color:var(--text-faint)">/100 · ${c.verdict}</span></div>
        ${laymanSub('credibility')}
      </div>
      ${reasonsBit}
      ${planBit}
    </div>`;
        }
        )();
        // ── Weekday-paired DiD detail ───────────────────────────────────────
        const pairedHtml = ( () => {
            if (cmp.tBPaired.length < 2 || cmp.netEffectPctPaired === null)
                return '';
            const ne = cmp.netEffectPctPaired;
            const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dowLabels = cmp.dowsCovered.map(d => dows[d]).join(', ') || '—';
            const cls = ne === null ? 'cn' : ne <= -10 ? 'cg' : ne >= 10 ? 'cr' : 'cw2';
            const resBit = cmp.statResid ? `Residual t-test: <strong>p=${cmp.statResid.p < 0.001 ? '<0.001' : cmp.statResid.p.toFixed(3)}</strong> (df=${cmp.statResid.df.toFixed(1)})${cmp.statResid.p < 0.05 ? ' — statistically significant isolated effect' : ' — not statistically significant'}` : '';
            return `<div class="paired-card" ${tipAttr('weekday_paired')}>
      <div class="paired-head">${tipIcon('weekday_paired')} <strong>Weekday-paired DiD</strong> · ${cmp.tBPaired.length} matched pairs · weekdays: ${dowLabels}</div>
      <div class="paired-grid">
        <div><div class="paired-lbl">Net effect (paired)</div><div class="paired-val ${cls}">${signStr(ne)} pp</div></div>
        <div><div class="paired-lbl">Target (paired)</div><div class="paired-val ${clsCh(cmp.targetPctChPaired)}">${signStr(cmp.targetPctChPaired)}</div><div class="paired-sub">${fmtN(cmp.tBPAvg)} → ${fmtN(cmp.tAPAvg)}</div></div>
        <div><div class="paired-lbl">${cmp.ctrlIsNetwork ? 'Network' : 'Selected peers'} (paired)</div><div class="paired-val ${clsCh(cmp.baselinePctChPaired)}">${signStr(cmp.baselinePctChPaired)}</div><div class="paired-sub">${fmtN(cmp.cBPAvg)} → ${fmtN(cmp.cAPAvg)}</div></div>
      </div>
      ${resBit ? `<div class="paired-foot">${resBit} ${tipIcon('did_residual')}</div>` : ''}
    </div>`;
        }
        )();
        // ── All-Sites Ranking — every active site's before→after change ─────
        // Ranked in the active Fix Focus metric (cost/execs re-express; memory/cores fall back to CPU).
        const rk = focusRanking(cmp, fixFocus);
        const rankHtml = ( () => {
            if (!rk.rows.length)
                return '';
            const isCost = rk.focusKey === 'cost';
            const maxAbs = Math.max(...rk.rows.map(r => Math.abs(r.rankCh)), 1);
            const rows = rk.rows.map( (r, i) => {
                const cls = r.isTarget ? 'target' : '';
                const chCls = r.rankCh < 0 ? 'cg' : r.rankCh > 0 ? 'cr' : 'cn';
                const barCls = r.rankCh < 0 ? '' : 'up';
                const barW = Math.max(1, (Math.abs(r.rankCh) / maxAbs) * 120);
                const short = r.domain.length > 36 ? r.domain.slice(0, 33) + '…' : r.domain;
                const actBadge = `<span class="act-badge act-${r.activityClass}">${r.activityClass.toLowerCase()}</span>`;
                // Secondary "per-request cost Δ" column — redundant when the focus already IS cost.
                const costBit = isCost ? '' : (r.costCh !== null ? `<td class="r"><span class="${clsCh(r.costCh)}" title="CPU per execution change">${signStr(r.costCh)}</span></td>` : '<td class="r"><span class="cd">—</span></td>');
                return `<tr class="${cls}"><td>#${i + 1}</td><td title="${esc(r.domain)}">${esc(short)}${r.isTarget ? ' <span class="av-b on" style="font-size:9px;padding:1px 6px">target</span>' : ''}</td><td>${actBadge}</td><td class="r">${rk.fmt(r.bVal)}</td><td class="r">${rk.fmt(r.aVal)}</td><td class="r ${chCls}">${signStr(r.rankCh)}<span class="rank-bar ${barCls}" style="width:${barW}px"></span></td><td class="r ${r.rankAbs < 0 ? 'cg' : r.rankAbs > 0 ? 'cr' : 'cn'}">${r.rankAbs >= 0 ? '+' : ''}${rk.fmt(r.rankAbs)}</td>${costBit}</tr>`;
            }
            ).join('');
            const med = rk.rows[Math.floor(rk.rows.length / 2)];
            // Focus metric's target/network change for the footer (CPU for cpu/auto + the
            // memory/cores fallback; the matching lens otherwise).
            const fLens = cmp.lenses[rk.focusKey === 'cost' ? 'perExec' : rk.focusKey === 'execs' ? 'exec' : 'cpu'];
            // Surface NEW / DIED / DEAD sites separately — they're excluded from the ranking but worth knowing about.
            const newDied = cmp.perSiteRaw.filter(r => ['NEW', 'DIED'].includes(r.activityClass));
            const newDiedHtml = newDied.length ? `<div style="font-size:11px;color:var(--text-faint);margin-top:6px;line-height:1.6"><strong>Excluded from ranking</strong> (no comparable baseline): ${newDied.map(r => `<span class="act-badge act-${r.activityClass}">${r.activityClass.toLowerCase()}</span> ${esc(r.domain)}`).join(' · ')}</div>` : '';
            const deadCount = data.deadSites?.length || 0;
            const deadHtml = deadCount > 0 ? `<div style="font-size:11px;color:var(--text-faint);margin-top:4px"><span class="act-badge act-INACTIVE">${deadCount} dead/parked</span> ${tipIcon('dead_site')} sites omitted: ${data.deadSites.slice(0, 6).map(d => esc(d)).join(', ')}${deadCount > 6 ? `, +${deadCount - 6} more` : ''}</div>` : '';
            const fallbackNote = rk.cpuFallback ? ` <span class="cw2" style="font-weight:600">Ranked by CPU — SiteGround doesn't report per-site ${rk.focusKey}, so the per-site ranking falls back to CPU.</span>` : '';
            const sortLabel = rk.cpuFallback ? 'CPU' : rk.label;
            return `<div class="sec"><div class="sec-t">📊 All-Sites Ranking — every active site, sorted by before→after <strong>${esc(sortLabel)}</strong> change ${tipIcon('site_rank')}${laymanSub('site_rank')}<span class="cw-hint">Catches the "everyone got quieter" trap. If your target is near the top of the list but most sites also improved, the network — not the fix — moved the number.${fallbackNote} Sites that went 0→active (NEW) or active→0 (DIED) are pulled out below the table because their %-change is meaningless without a baseline.</span></div>
      <div class="ch" id="ch-allsites" style="height:${Math.max(180, Math.min(420, rk.rows.length * 22 + 40))}px"></div>
      <div class="tw" style="margin-top:10px"><table class="rank-tbl"><thead><tr>
        <th>Rank</th><th>Site</th>
        <th ${tipAttr('activity_class')}>Activity</th>
        <th class="r" data-tip="${esc(`Average daily ${sortLabel} (${rk.unit}) for this site over the <strong>before</strong> window.`)}">Before avg</th>
        <th class="r" data-tip="${esc(`Average daily ${sortLabel} (${rk.unit}) for this site over the <strong>after</strong> window.`)}">After avg</th>
        <th class="r" data-tip="${esc(`Per-site percent change in ${sortLabel} between the before and after windows. Different from the headline Net Effect — that one compares the target site against the rest of the network.`)}">% Change</th>
        <th class="r" data-tip="${esc(`Absolute change in ${rk.unit} between the windows.`)}">Abs Δ</th>
        ${isCost ? '' : `<th class="r" ${tipAttr('cpu_exec_growth')}>Per-req Δ%</th>`}
      </tr></thead><tbody>${rows}</tbody></table></div>
      ${newDiedHtml}${deadHtml}
      <div style="font-size:11px;color:var(--text-faint);margin-top:8px;line-height:1.6">
        Median site change: <strong class="${clsCh(med?.rankCh)}">${signStr(med?.rankCh)}</strong> &middot; Network: <strong class="${clsCh(fLens.netCh)}">${signStr(fLens.netCh)}</strong> &middot; Target: <strong class="${clsCh(fLens.tgtCh)}">${signStr(fLens.tgtCh)}</strong>
      </div>
    </div>`;
        }
        )();

        const allD = [...cmp.bDates, ...cmp.aDates];
        const dailyRows = allD.map(date => {
            const isBefore = cmp.bDates.includes(date);
            const inc = data.incompleteDates.has(date);
            const tgt = Math.round(data.sv(target, date));
            const ctl = Math.round(ctrlDoms.reduce( (s, d) => s + data.sv(d, date), 0));
            const acct = Math.round(data.acctMap.get(date) || 0);
            const exec = data.hasExec ? Math.round(data.ev(target, date)) : null;
            const coresUsed = +(data.coresUsedMap.get(date) || 0).toFixed(2);
            const limit = data.limitMap.get(date) || 9;
            const share = acct ? (tgt / acct * 100).toFixed(2) : '—';
            const ratio = ctl ? (tgt / ctl * 100).toFixed(2) : '—';
            // Cost focus: show the target's per-request cost for the day so the table speaks
            // the same metric as the chart + hero above it.
            const showCost = fixFocus === 'cost' && data.hasExec;
            const costReq = showCost ? (exec > 0 ? fmtD(data.sv(target, date) / data.ev(target, date), 3) : '—') : null;
            return `<tr class="${inc ? 'incomplete' : ''}"><td>${esc(date)}${inc ? `<span class="inc-badge" ${tipAttr('incomplete_day')}>partial</span>` : ''}</td>
      <td><span class="av-b ${isBefore ? '' : 'on'}" style="font-size:10px">${isBefore ? 'Before' : 'After'}</span></td>
      <td class="r">${fmtN(tgt)}</td><td class="r">${fmtN(ctl)}</td><td class="r">${fmtN(acct)}</td>
      <td class="r">${share}%</td><td class="r">${ratio}%</td>
      ${exec !== null ? `<td class="r">${fmtN(exec)}</td>` : ''}
      ${costReq !== null ? `<td class="r"><strong>${costReq}</strong></td>` : ''}
      <td class="r ${coresUsed > limit * 0.75 ? 'cr' : ''}">${coresUsed} / ${limit}</td>
    </tr>`;
        }
        );

        // ── Three-lens hero: Executions / CPU sec / Time per Execution ────────
        // Two peer rows: the user's *selected* group (whatever's in the dropdown)
        // and the *whole network* baseline (always every other active site, for the
        // hardest-to-argue-against DiD reading). When the user picks "Whole Network"
        // as their group, the two rows would be identical, so we collapse to one.
        const ctrlIsNetwork = ctrlDoms.length === cmp.networkDoms.length
            && ctrlDoms.every(d => cmp.networkDoms.includes(d));
        // ctrlLabel is declared earlier (just above the Net Effect hero) to avoid a TDZ crash.
        const lensBaseName = ctrlIsNetwork ? 'the network' : 'your selected peers';
        const renderLens = (lens, fmtFn, isPrimary) => {
            const tCh = lens.tgtCh;
            // Net effect is graded against the SELECTED group (baseline). When that group is the
            // whole network the two coincide. The other peer row is shown for context.
            const nCh = ctrlIsNetwork ? lens.netCh : lens.ctrlCh;
            const netDiD = (tCh !== null && nCh !== null) ? tCh - nCh : null;
            const heroCls = netDiD === null ? 'cn' : netDiD <= -10 ? 'cg' : netDiD >= 10 ? 'cr' : Math.abs(netDiD) > 3 ? 'cw2' : 'cn';
            const heroLbl = netDiD === null ? '—' : `${netDiD > 0 ? '+' : ''}${netDiD.toFixed(1)} pp`;
            const row = (label, before, after, ch) => {
                const arrow = ch === null ? '→' : ch < 0 ? '↓' : ch > 0 ? '↑' : '→';
                return `<div class="lens-row">
          <div class="lens-row-lbl">${esc(label)}</div>
          <div class="lens-row-vals">
            <span class="lens-row-pair">${before !== null ? fmtFn(before) : '—'} → ${after !== null ? fmtFn(after) : '—'}</span>
            <span class="lens-row-ch ${clsCh(ch)}">${arrow} ${ch === null ? '—' : signStr(ch)}</span>
          </div>
        </div>`;
            };
            const verdict = netDiD === null ? 'Insufficient data' : netDiD <= -15 ? `✅ Target beat ${lensBaseName} by ${Math.abs(netDiD).toFixed(0)} pp` : netDiD < -5 ? `⚠️ Modest peer-relative gain (${netDiD.toFixed(1)} pp)` : Math.abs(netDiD) <= 5 ? `→ Target moved with ${lensBaseName} — no isolated effect` : `🔴 Target underperformed ${lensBaseName} by ${netDiD.toFixed(1)} pp`;
            // Mark whichever peer row is the active baseline (plain text — row() escapes labels).
            return `<div class="lens-card${isPrimary ? ' lens-primary' : ''}">
        <div class="lens-card-h">${tipIcon(lens.tip)} ${esc(lens.label)} <span class="lens-card-unit">(${esc(lens.unit)})</span>${isPrimary ? '<span class="lens-primary-badge">your focus</span>' : ''}</div>
        <div class="lens-card-hero ${heroCls}">${heroLbl}</div>
        <div class="lens-card-verdict">${verdict}</div>
        <div class="lens-rows">
          ${row('Target (' + target.split('.')[0] + ')', lens.tgtBefore, lens.tgtAfter, lens.tgtCh)}
          ${ctrlIsNetwork ? '' : row(`${ctrlLabel} (${ctrlDoms.length} site${ctrlDoms.length === 1 ? '' : 's'}) · baseline`, lens.ctrlBefore, lens.ctrlAfter, lens.ctrlCh)}
          ${row('Whole Network (' + cmp.networkDoms.length + ' sites)' + (ctrlIsNetwork ? ' · baseline' : ' · context'), lens.netBefore, lens.netAfter, lens.netCh)}
        </div>
      </div>`;
        };
        // Which lens (if any) matches the chosen Fix Focus — that one renders first and gets a
        // "your focus" badge so the eye lands on the metric the report is actually about.
        const focusLensKey = fixFocus === 'cost' ? 'perExec' : fixFocus === 'execs' ? 'exec' : fixFocus === 'cpu' ? 'cpu' : null;
        const lensDefs = [
            { key: 'exec', lens: cmp.lenses.exec, fmt: fmtN },
            { key: 'cpu', lens: cmp.lenses.cpu, fmt: fmtN },
            { key: 'perExec', lens: cmp.lenses.perExec, fmt: v => fmtD(v, 3) + 's' }
        ];
        if (focusLensKey)
            lensDefs.sort( (a, b) => (a.key === focusLensKey ? -1 : 0) - (b.key === focusLensKey ? -1 : 0));
        const lensesHtml = `<div class="lens-row-strip">
      <div class="lens-strip-h">📐 Three-Lens Fix Verdict <span class="lens-strip-sub">Read all three to know whether traffic dropped, total CPU dropped, or each request got cheaper. The big "pp" number is target's % change minus ${ctrlIsNetwork ? "the whole network's" : 'your selected group\'s'} — the isolated, plan-immune, peer-relative reading.${ctrlIsNetwork ? ' Your selected group IS the whole network, so only one peer row is shown.' : ` Your selected group (${esc(ctrlLabel)}) is the baseline; the whole network is shown as a context row.`}</span></div>
      <div class="lens-grid">
        ${lensDefs.map(d => renderLens(d.lens, d.fmt, d.key === focusLensKey)).join('')}
      </div>
    </div>`;
        const excludedHtml = cmp.excludedFromNet.length ? `<div class="excl-banner" data-tip="${esc('<strong>Excluded sites</strong> are dropped from every per-site calculation: control group, network, ranking, and DiD. ' + cmp.excludedFromNet.length + ' sites currently excluded: ' + cmp.excludedFromNet.join(', '))}"><span style="font-weight:700">🚫 ${cmp.excludedFromNet.length} sites excluded</span> from the network + ranking comparisons · <span style="text-decoration:underline">click to manage</span></div>` : '';
        const focusHero = renderFocusHero(cmp, fixFocus, target, data, ctrlDoms, ctrlLabel);
        // When a specific Fix Focus is chosen, the existing CPU-only Net Effect hero (neHtml)
        // becomes redundant with the new hero. Keep it only for CPU focus + 'auto'; suppress
        // for cost/execs/memory/cores/combo so the page isn't double-stating the same number.
        const showNeHero = fixFocus === 'auto' || fixFocus === 'cpu';
        // Filter row context: weekdays-only or minActivity values pinned to the top so the
        // reader knows the comparison they're looking at is narrowed.
        const filterCtx = [];
        if (weekdaysOnly)
            filterCtx.push('weekdays only (Sat/Sun dropped)');
        if (minActivityCpu > 0)
            filterCtx.push(`min peer activity ${fmtN(minActivityCpu)} CPU sec/day`);
        if (useCustom && cBefStart && cAftEnd)
            filterCtx.push('custom date range');
        const filterCtxHtml = filterCtx.length ? `<div class="filter-ctx">🔎 Filters active: <strong>${filterCtx.join(' · ')}</strong></div>` : '';
        const summTxt = buildSummTxt(cmp, target, fixDate, ctrlDoms, interp, fixFocus);
        out.innerHTML = `
    <div class="sbar"><strong>${esc(target)}</strong> &nbsp;·&nbsp; Fix: <strong>${esc(fixDate)}</strong> &nbsp;·&nbsp; Before: ${esc(cmp.bStart)}→${esc(cmp.bEnd)} (<strong>${cmp.bDates.length}</strong> days) &nbsp;·&nbsp; After: ${esc(cmp.aStart)}→${esc(cmp.aEnd)} (<strong>${cmp.aDates.length}</strong> days) &nbsp;·&nbsp; Control${ctrlPreset === 'auto' ? ' (frozen)' : ''} (${ctrlDoms.length}): <span style="color:#94a3b8">${esc(ctrlDoms.length > 6 ? ctrlDoms.slice(0, 6).join(', ') + ` +${ctrlDoms.length - 6} more` : ctrlDoms.join(', '))}</span></div>
    ${excludedHtml}
    ${filterCtxHtml}
    ${focusHero}
    ${lensesHtml}
    ${curStatHtml}
    ${credHtml}
    ${showNeHero ? neHtml : ''}
    ${showNeHero ? pairedHtml : ''}
    ${interp.length ? `<div class="interp"><div class="interp-t">📊 ${fixFocus !== 'auto' ? esc(FOCUS_LABELS[fixFocus] || 'Fix') + ' — Analysis' : 'Data Interpretation'}</div>${interp.map(l => `<div class="interp-item">${l}</div>`).join('')}</div>` : ''}
    <div class="cmps">${cards.join('')}</div>
    <div class="cw"><div class="cw-t">📉 ${fixFocus === 'memory' || fixFocus === 'cores'
        ? `${esc(FOCUS_LABELS[fixFocus])} over the window — server-wide ${tipIcon('control_group')}<span class="cw-hint">${esc(FOCUS_LABELS[fixFocus])} is reported account-wide only (SiteGround doesn't break it down per site), so this plots the single server series with the before/after window averages and the Fix marker. Read it alongside the target's CPU-share movement in the hero above.</span>`
        : fixFocus !== 'auto' && fixFocus !== 'cpu'
        ? `${esc(FOCUS_LABELS[fixFocus])}: Target vs Control vs Network — fix date marked ${tipIcon('control_group')}${laymanSub('control_group')}<span class="cw-hint">All three lines are now in <strong>${esc(FOCUS_LABELS[fixFocus])}</strong> (${fixFocus === 'cost' ? 'sec/req' : 'req/day'}) — matching your Fix Focus, so the chart can't drift against a different metric than the verdict above. Blue = target, dashed purple = control group, dark = whole network. Dotted lines mark the target's before/after window average; amber = the fix date; the after-period is lightly shaded.</span>`
        : `Target vs Control vs Account — fix date marked ${tipIcon('control_group')}${laymanSub('control_group')}<span class="cw-hint">Blue line = your target site, pink dashed = control group total, dark line = whole-account CPU, grey thin = server cores in use. The amber 'Fix' marker shows the fix date. After-period is lightly shaded.</span>`}</div><div class="ch tall" id="ch-cmp"></div></div>
    ${data.hasExec ? `<div class="cw"><div class="cw-t">⚙️ Volume vs Cost — has each request gotten cheaper, or are there just fewer of them? ${tipIcon('cpu_exec_ratio')}${laymanSub('cpu_exec_ratio')}<span class="cw-hint">Two stories overlaid: bars are <strong>daily executions</strong> (volume), line is <strong>CPU per execution</strong> (cost per request). The win pattern you're looking for: bars stay similar height but the line drops — that means traffic didn't change, you just made each hit cheaper. Bars dropping with line steady = you blocked traffic instead.</span></div><div class="ch tall" id="ch-cmp-cost"></div></div>` : ''}
    ${data.hasMem ? `<div class="cw"><div class="cw-t">🧠 Memory (GB) over the window ${tipIcon('mem_combined')}${laymanSub('mem_combined')}<span class="cw-hint">Daily peak memory used (GB). Fixes that drop CPU should usually also reduce memory pressure — if memory stayed the same, the fix was CPU-only.</span></div><div class="ch" id="ch-cmp-mem"></div></div>` : ''}
    <div class="sec"><div class="sec-t">Daily Breakdown</div>
    <div class="tw"><table><thead><tr>
      <th>Date</th><th>Period</th>
      <th class="r" ${tipAttr('cpu_seconds')}>Target CPU</th>
      <th class="r" ${tipAttr('control_group')}>Control CPU</th>
      <th class="r" ${tipAttr('account_total')}>Account CPU</th>
      <th class="r" ${tipAttr('target_share')}>Tgt %</th>
      <th class="r" ${tipAttr('target_ratio')}>Tgt/Ctrl</th>
      ${data.hasExec ? `<th class="r" ${tipAttr('program_executions')}>Exec</th>` : ''}
      ${fixFocus === 'cost' && data.hasExec ? `<th class="r" ${tipAttr('cpu_exec_ratio')}>Cost/req</th>` : ''}
      <th class="r" ${tipAttr('core_pct')}>Cores Used</th>
    </tr></thead><tbody>${dailyRows.join('')}</tbody></table></div></div>
    ${rankHtml}
    <div class="sec"><div class="sec-t">Summary Text &nbsp;<button class="btn sec sm" data-a="copy">Copy</button></div><div class="summbox" id="sum-box">${esc(summTxt)}</div></div>`;
        setTimeout( () => {
            initCmpChart(data, target, fixDate, cmp, ctrlDoms, fixFocus);
            if (rk.rows.length)
                initAllSitesRank(rk, target);
        }
        , 0);
    }
    ;

    // ── Fix Focus metric resolver ─────────────────────────────────────────────
    // Single source of truth for "which series does the evidence layer plot/sort/express
    // when the user picks a Fix Focus". The verdict layer (hero, lenses, interpret) is already
    // focus-aware; this lets the charts, ranking and daily table follow the SAME metric so the
    // evidence underneath the verdict can't drift against a different number.
    //
    // Returns, aligned to allD = [...bDates, ...aDates]:
    //   daily.{target,control,network}  per-day series (per-site metrics: cpu/execs/cost)
    //   daily.account                   per-day server-wide series (memory/cores — SG reports no per-site)
    //   means.{tB,tA,cB,cA,nB,nA,accB,accA}  window means, kept consistent with the lens/hero numbers
    // Cost is a ratio: the per-day series is dailyCPU/dailyExec (null on zero-exec days), while the
    // window means come from the lens (sum/sum, weighted) so the chart's mean markLines match the hero.
    const focusMetric = (focus, cmp, data, target, ctrlDoms) => {
        const allD = [...cmp.bDates, ...cmp.aDates];
        const sumOver = (doms, d, get) => doms.reduce((s, dd) => s + get(dd, d), 0);
        const net = cmp.networkDoms;
        const f = (() => {
            if (focus === 'execs') return {
                key: 'execs', label: 'Executions', unit: 'req/day', fmt: fmtN, perSiteDiD: true, accountOnly: false,
                tgt: d => data.ev(target, d), ctl: d => sumOver(ctrlDoms, d, data.ev), nw: d => sumOver(net, d, data.ev),
                lens: cmp.lenses.exec
            };
            if (focus === 'cost') return {
                key: 'cost', label: 'Cost per request', unit: 'sec/req', fmt: v => fmtD(v, 3), perSiteDiD: true, accountOnly: false,
                tgt: d => { const e = data.ev(target, d); return e > 0 ? data.sv(target, d) / e : null; },
                ctl: d => { const e = sumOver(ctrlDoms, d, data.ev); return e > 0 ? sumOver(ctrlDoms, d, data.sv) / e : null; },
                nw: d => { const e = sumOver(net, d, data.ev); return e > 0 ? sumOver(net, d, data.sv) / e : null; },
                lens: cmp.lenses.perExec
            };
            if (focus === 'memory') return {
                key: 'memory', label: 'Memory used', unit: 'GB', fmt: v => fmtD(v, 2), perSiteDiD: false, accountOnly: true,
                acct: d => data.memDailyGbMap?.get(d) ?? null, accB: avgAll(cmp.mB), accA: avgAll(cmp.mA)
            };
            if (focus === 'cores') return {
                key: 'cores', label: 'Cores in use', unit: 'cores', fmt: v => fmtD(v, 2), perSiteDiD: false, accountOnly: true,
                acct: d => data.coresUsedMap?.get(d) ?? null, accB: avgAll(cmp.kB), accA: avgAll(cmp.kA)
            };
            // cpu (and the 'auto'/'combo' fallbacks) — default CPU seconds
            return {
                key: 'cpu', label: 'CPU Seconds', unit: 'CPU sec', fmt: fmtN, perSiteDiD: true, accountOnly: false,
                tgt: d => data.sv(target, d), ctl: d => sumOver(ctrlDoms, d, data.sv), nw: d => sumOver(net, d, data.sv),
                lens: cmp.lenses.cpu
            };
        })();
        const daily = f.accountOnly
            ? { target: [], control: [], network: [], account: allD.map(f.acct) }
            : { target: allD.map(f.tgt), control: allD.map(f.ctl), network: allD.map(f.nw), account: [] };
        const means = f.accountOnly
            ? { accB: f.accB, accA: f.accA }
            : { tB: f.lens.tgtBefore, tA: f.lens.tgtAfter, cB: f.lens.ctrlBefore, cA: f.lens.ctrlAfter, nB: f.lens.netBefore, nA: f.lens.netAfter };
        return { key: f.key, label: f.label, unit: f.unit, fmt: f.fmt, perSiteDiD: f.perSiteDiD, accountOnly: f.accountOnly, allD, daily, means };
    }
    ;

    // Per-site All-Sites ranking expressed in the active Fix Focus metric. cost/execs re-sort
    // AND re-express the before/after columns so "where does my target rank" answers the metric
    // the report is about — not always CPU. cpu/auto stay on CPU (rows match cmp.sortedByChange).
    // memory/cores have no per-site figure (SG limitation) so they fall back to CPU with a flag.
    const focusRanking = (cmp, focus) => {
        const spec = focus === 'execs'
            ? { getCh: r => r.exCh, getB: r => r.exBAvg, getA: r => r.exAAvg, fmt: fmtN, label: 'executions', unit: 'req/day', cpuFallback: false }
            : focus === 'cost'
            ? { getCh: r => r.costCh, getB: r => r.costB, getA: r => r.costA, fmt: v => fmtD(v, 3), label: 'cost per request', unit: 'sec/req', cpuFallback: false }
            : { getCh: r => r.pctCh, getB: r => r.bAvg, getA: r => r.aAvg, fmt: fmtN, label: 'CPU', unit: 'CPU sec/day', cpuFallback: (focus === 'memory' || focus === 'cores') };
        const rows = cmp.perSiteRaw
            .filter(r => !['NEW', 'DIED', 'INACTIVE'].includes(r.activityClass) && (r.isTarget || !isExcluded(r.domain)))
            .map(r => {
                const b = spec.getB(r), a = spec.getA(r), ch = spec.getCh(r);
                return { ...r, bVal: b, aVal: a, rankCh: ch, rankAbs: (a !== null && b !== null && a !== undefined && b !== undefined) ? a - b : null };
            })
            .filter(r => r.rankCh !== null && isFinite(r.rankCh) && r.bVal)
            .sort((x, y) => x.rankCh - y.rankCh);
        const targetRank = rows.findIndex(r => r.isTarget) + 1;
        const targetPercentile = rows.length > 1 && targetRank > 0 ? ((rows.length - targetRank) / (rows.length - 1)) * 100 : null;
        // Network's change in this same metric (from the matching lens) — drawn as a reference
        // marker on the ranking chart so "did the whole server move?" reads at a glance.
        const lens = cmp.lenses[focus === 'cost' ? 'perExec' : focus === 'execs' ? 'exec' : 'cpu'];
        const networkCh = lens ? lens.netCh : null;
        return { rows, fmt: spec.fmt, label: spec.label, unit: spec.unit, cpuFallback: spec.cpuFallback, focusKey: focus, targetRank, targetPercentile, networkCh };
    }
    ;

    // Main chart re-expressed in the active Fix Focus metric. Drawn into the same #ch-cmp slot.
    // Per-site metrics (cost/execs) plot target vs control vs whole-network in that metric;
    // server-wide metrics (memory/cores) plot a single account series — matching the hero's
    // "this is correlation, not a per-site DiD" framing. Every series carries an end-of-line
    // value label, and the target gets before/after window-mean markLines (consistent with the
    // hero numbers) plus the Fix marker and shaded after-period.
    const initFocusCmpChart = (data, target, fixDate, cmp, ctrlDoms, focus) => {
        const fm = focusMetric(focus, cmp, data, target, ctrlDoms);
        const allD = fm.allD;
        const C = themeChartColors();
        const fixMark = allD.includes(fixDate) ? [{
            xAxis: fixDate,
            lineStyle: { color: '#FFC20E', type: 'dashed', width: 2 },
            label: { formatter: 'Fix', color: '#FFC20E', fontSize: 10 }
        }] : [];
        const afterArea = {
            silent: true,
            itemStyle: { color: 'rgba(39,170,225,0.05)' },
            data: [[{ xAxis: cmp.aStart }, { xAxis: cmp.aEnd }]]
        };
        const endLbl = color => ({ show: true, formatter: p => fm.fmt(p.value), color, fontSize: 10, fontWeight: 700, distance: 5 });
        const meanLine = (val, txt, color) => (val === null || val === undefined || !isFinite(val)) ? null : {
            yAxis: +(+val).toFixed(4),
            lineStyle: { color, type: 'dotted', width: 1.3 },
            label: { formatter: `${txt} ${fm.fmt(val)}`, color, fontSize: 9, position: 'insideEndTop' }
        };
        let series, legendData;
        if (fm.accountOnly) {
            // Single account-level series (memory/cores have no per-site breakdown).
            const meanMarks = [meanLine(fm.means.accB, 'before avg', '#0074B4'), meanLine(fm.means.accA, 'after avg', '#2D9E5A')].filter(Boolean);
            legendData = [`Account ${fm.label}`];
            series = [{
                ...mkLn(`Account ${fm.label}`, fm.daily.account, '#27AAE1', {
                    connectNulls: false,
                    endLabel: endLbl('#27AAE1'),
                    areaStyle: { color: 'rgba(39,170,225,0.10)' },
                    markArea: afterArea,
                    markLine: { silent: true, symbol: 'none', data: [...fixMark, ...meanMarks] }
                })
            }];
        } else {
            // Per-site: target + control group + whole network in the focus metric.
            const meanMarks = [meanLine(fm.means.tB, 'before avg', '#0074B4'), meanLine(fm.means.tA, 'after avg', '#2D9E5A')].filter(Boolean);
            const netName = `Whole Network (${cmp.networkDoms.length})`;
            const ctrlName = `Control (${ctrlDoms.length})`;
            legendData = [target, ctrlName, netName];
            series = [{
                ...mkLn(target, fm.daily.target, '#27AAE1', {
                    connectNulls: false,
                    endLabel: endLbl('#27AAE1'),
                    markArea: afterArea,
                    markLine: { silent: true, symbol: 'none', data: [...fixMark, ...meanMarks] }
                })
            }, {
                ...mkLn(ctrlName, fm.daily.control, '#7B5EA8', {
                    connectNulls: false, symbol: 'circle', symbolSize: 3,
                    lineStyle: { color: '#7B5EA8', width: 2, type: 'dashed' },
                    endLabel: endLbl('#7B5EA8')
                })
            }, {
                ...mkLn(netName, fm.daily.network, '#0074B4', {
                    connectNulls: false, symbol: 'none',
                    lineStyle: { color: '#0074B4', width: 1.5 },
                    endLabel: endLbl('#0074B4')
                })
            }];
        }
        cinit('ch-cmp', {
            ...BASE,
            legend: { ...BASE.legend, bottom: 28, data: legendData },
            grid: { ...BASE.grid, bottom: 76, right: 92 },
            tooltip: {
                ...BASE.tooltip,
                trigger: 'axis',
                valueFormatter: v => v === null || v === undefined ? '—' : `${fm.fmt(v)} ${fm.unit}`
            },
            xAxis: { ...BASE.xAxis, data: allD },
            yAxis: mkY(`${fm.label} (${fm.unit})`, {
                axisLabel: { ...BASE.yAxis.axisLabel, formatter: v => fm.fmt(v) }
            }),
            series,
            dataZoom: [...BASE.dataZoom]
        });
    }
    ;

    const initCmpChart = (data, target, fixDate, cmp, ctrlDoms, focus = 'auto') => {
        // Non-CPU focuses re-express the MAIN chart (ch-cmp) in the chosen metric so it can't
        // visually contradict the focus hero above it. The secondary volume/cost + memory charts
        // below are metric-specific already and stay for every focus. CPU/auto keep the original
        // rich CPU+cores main view unchanged.
        const focusMain = !!focus && focus !== 'auto' && focus !== 'cpu';
        const allD = [...cmp.bDates, ...cmp.aDates];
        const tV = allD.map(d => Math.round(data.sv(target, d)));
        const cV = allD.map(d => Math.round(ctrlDoms.reduce( (s, cd) => s + data.sv(cd, d), 0)));
        const aV = allD.map(d => Math.round(data.acctMap.get(d) || 0));
        // Cores in use per day (plan-immune)
        const kV = allD.map(d => +(data.coresUsedMap.get(d) || 0).toFixed(3));
        const eV = data.hasExec ? allD.map(d => Math.round(data.ev(target, d))) : null;
        const ml = Math.max(...allD.map(d => data.limitMap.get(d) || 9));
        // Focus-specific main chart for cost/execs/memory/cores; otherwise the CPU view below.
        if (focusMain)
            initFocusCmpChart(data, target, fixDate, cmp, ctrlDoms, focus);
        if (!focusMain) cinit('ch-cmp', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: [target, 'Control', 'Account', 'Cores in Use', ...(eV ? ['Exec'] : [])]
            },
            grid: {
                ...BASE.grid,
                bottom: 76,
                right: 78
            },
            xAxis: {
                ...BASE.xAxis,
                data: allD
            },
            yAxis: [mkY('CPU Seconds', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }), mkY('Cores in Use', {
                min: 0,
                max: ml,
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => (+v).toFixed(1)
                }
            })],
            series: [{
                ...mkLn(target, tV, '#27AAE1', {
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        data: [...(allD.includes(fixDate) ? [{
                            xAxis: fixDate,
                            lineStyle: {
                                color: '#FFC20E',
                                type: 'dashed',
                                width: 2
                            },
                            label: {
                                formatter: 'Fix',
                                color: '#FFC20E',
                                fontSize: 10
                            }
                        }] : []), ...((data.planChanges || []).filter(c => c.date >= cmp.bStart && c.date <= cmp.aEnd).map(c => ({
                            xAxis: c.date,
                            lineStyle: {
                                color: '#a78bfa',
                                type: 'dashed',
                                width: 2
                            },
                            label: {
                                formatter: `Plan ${c.kind === 'core' ? c.fromVal + '→' + c.toVal + 'c' : c.fromVal + '→' + c.toVal + 'GB'}`,
                                color: '#a78bfa',
                                fontSize: 9
                            }
                        })))]
                    },
                    markArea: {
                        silent: true,
                        itemStyle: {
                            color: 'rgba(39,170,225,0.05)'
                        },
                        data: [[{
                            xAxis: cmp.aStart
                        }, {
                            xAxis: cmp.aEnd
                        }]]
                    },
                })
            }, {
                ...mkLn('Control', cV, '#7B5EA8', {
                    lineStyle: {
                        color: '#7B5EA8',
                        width: 2,
                        type: 'dashed'
                    },
                    symbol: 'circle',
                    symbolSize: 3
                })
            }, {
                ...mkLn('Account', aV, '#0074B4', {
                    lineStyle: {
                        color: '#0074B4',
                        width: 1.5
                    },
                    symbol: 'none'
                })
            }, {
                ...mkLn('Cores in Use', kV, '#64748b', {
                    yAxisIndex: 1,
                    symbol: 'none',
                    markLine: {
                        silent: true,
                        lineStyle: {
                            color: '#ef4444',
                            type: 'dashed',
                            width: 1
                        },
                        data: [{
                            yAxis: +(ml * 0.75).toFixed(2)
                        }],
                        label: {
                            formatter: `${(ml * 0.75).toFixed(1)} (75%)`,
                            fontSize: 9,
                            color: '#ef4444'
                        }
                    }
                })
            }, ...(eV ? [{
                name: 'Exec',
                type: 'bar',
                data: eV,
                barMaxWidth: 10,
                itemStyle: {
                    color: 'rgba(255,194,14,0.2)',
                    borderColor: 'rgba(255,194,14,0.45)',
                    borderWidth: 1
                }
            }] : []), ],
            dataZoom: [...BASE.dataZoom],
        });
        // Volume-vs-cost chart: daily executions (bars) + CPU-per-execution (line) over the same window.
        // Reveals whether a fix reduced volume, cost per request, or both.
        if (data.hasExec && eV) {
            const cpuExec = allD.map( (d, i) => {
                const ex = eV[i] || 0
                  , cpu = tV[i] || 0;
                return ex > 0 ? +(cpu / ex).toFixed(3) : null;
            }
            );
            cinit('ch-cmp-cost', {
                ...BASE,
                legend: {
                    ...BASE.legend,
                    bottom: 28,
                    data: ['Daily executions', 'CPU per execution']
                },
                grid: {
                    ...BASE.grid,
                    bottom: 78,
                    right: 78
                },
                tooltip: {
                    ...BASE.tooltip,
                    trigger: 'axis',
                    formatter: params => {
                        const idx = params[0].dataIndex;
                        const isAfter = allD[idx] >= cmp.aStart;
                        const ex = eV[idx] || 0
                          , cost = cpuExec[idx];
                        return `<strong>${esc(allD[idx])}</strong> ${isAfter ? '<span style="color:#4ade80">(after)</span>' : '<span style="color:#94a3b8">(before)</span>'}<br>` + `<span style="color:#fbbf24">▮</span> Executions <strong>${fmtN(ex)}</strong><br>` + `<span style="color:#60a5fa">━</span> CPU/Exec <strong>${cost !== null ? fmtD(cost, 2) : '—'}</strong> sec/req`;
                    }
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: allD
                },
                yAxis: [mkY('Executions / day', {
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => fmtN(v)
                    }
                }), mkY('CPU sec / execution', {
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => v.toFixed(2)
                    }
                })],
                series: [{
                    name: 'Daily executions',
                    type: 'bar',
                    data: eV,
                    itemStyle: {
                        color: 'rgba(255,194,14,0.5)',
                        borderColor: '#FFC20E',
                        borderWidth: 1,
                        borderRadius: [2, 2, 0, 0]
                    },
                    markLine: allD.includes(fixDate) ? {
                        silent: true,
                        lineStyle: {
                            color: '#FFC20E',
                            type: 'dashed',
                            width: 2
                        },
                        data: [{
                            xAxis: fixDate
                        }],
                        label: {
                            formatter: 'Fix',
                            color: '#FFC20E',
                            fontSize: 10
                        }
                    } : undefined
                }, {
                    name: 'CPU per execution',
                    type: 'line',
                    yAxisIndex: 1,
                    data: cpuExec,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    connectNulls: false,
                    lineStyle: {
                        color: '#27AAE1',
                        width: 2.5
                    },
                    itemStyle: {
                        color: '#27AAE1'
                    },
                    z: 5
                }],
                dataZoom: [...BASE.dataZoom],
            });
        }
        // Memory over the window — peak memory GB per day, fix-date marked
        if (data.hasMem) {
            const memV = allD.map(d => data.memDailyGbMap?.get(d) ?? null);
            const memLimGb = data.currentMemLimitGb || Math.max(...memV.filter(v => v !== null), 14);
            cinit('ch-cmp-mem', {
                ...BASE,
                legend: {
                    show: false
                },
                grid: {
                    left: 56,
                    right: 18,
                    top: 18,
                    bottom: 50
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: allD
                },
                yAxis: mkY('Memory (GB)', {
                    min: 0,
                    max: memLimGb,
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => `${(+v).toFixed(1)}`
                    }
                }),
                series: [{
                    type: 'line',
                    data: memV,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    connectNulls: false,
                    lineStyle: {
                        color: '#a78bfa',
                        width: 2
                    },
                    itemStyle: {
                        color: '#a78bfa'
                    },
                    areaStyle: {
                        color: 'rgba(167,139,250,0.12)'
                    },
                    markLine: {
                        silent: true,
                        lineStyle: {
                            color: '#FFC20E',
                            type: 'dashed',
                            width: 2
                        },
                        data: [...(allD.includes(fixDate) ? [{
                            xAxis: fixDate
                        }] : []), {
                            yAxis: +(memLimGb * 0.85).toFixed(2),
                            lineStyle: {
                                color: '#ef4444',
                                type: 'dashed',
                                width: 1.2
                            },
                            label: {
                                formatter: `${(memLimGb * 0.85).toFixed(1)} GB (85%)`,
                                color: '#ef4444',
                                fontSize: 9
                            }
                        }],
                        label: {
                            color: '#FFC20E',
                            fontSize: 10
                        }
                    }
                }],
                dataZoom: [...BASE.dataZoom]
            });
        }
    }
    ;

    // Horizontal bar chart of every active site's before→after % change in the active Fix
    // Focus metric. Most-improved at top, regressions at bottom; target coloured distinctly.
    // Takes the focusRanking object (rk) so the bars match the table + the verdict metric.
    const initAllSitesRank = (rk, target) => {
        // Display order for the chart: bottom of array renders at the top of the chart, so we
        // reverse once and keep every parallel array (labels/values/colors/rows) in the same
        // display order — that way the tooltip lookup by index returns the correct site.
        const displayRows = rk.rows.slice().reverse();
        const labels = displayRows.map(r => {
            const short = r.domain.length > 28 ? r.domain.slice(0, 25) + '…' : r.domain;
            return r.isTarget ? `★ ${short}` : short;
        }
        );
        const values = displayRows.map(r => +r.rankCh.toFixed(2));
        const colors = displayRows.map(r => r.isTarget ? '#27AAE1' : (r.rankCh < 0 ? '#2D9E5A' : '#C0392B'));
        // Reference markers: median, target. Use the original sorted-ascending list so "median"
        // picks the middle of the sorted distribution, not the middle of the display order.
        const rows = rk.rows;
        const med = rows[Math.floor(rows.length / 2)]?.rankCh ?? 0;
        const markLineData = [{
            xAxis: 0,
            lineStyle: {
                color: '#64748b',
                type: 'solid',
                width: 1
            },
            label: {
                formatter: '0%',
                position: 'end',
                color: '#64748b',
                fontSize: 9
            }
        }, {
            xAxis: +med.toFixed(2),
            lineStyle: {
                color: '#94a3b8',
                type: 'dashed',
                width: 1
            },
            label: {
                formatter: `median ${med >= 0 ? '+' : ''}${med.toFixed(0)}%`,
                position: 'end',
                color: '#94a3b8',
                fontSize: 9
            }
        }, ];
        if (rk.networkCh !== null && rk.networkCh !== undefined && isFinite(rk.networkCh))
            markLineData.push({
                xAxis: +rk.networkCh.toFixed(2),
                lineStyle: {
                    color: '#7B5EA8',
                    type: 'dashed',
                    width: 1.5
                },
                label: {
                    formatter: `network ${rk.networkCh >= 0 ? '+' : ''}${rk.networkCh.toFixed(0)}%`,
                    position: 'end',
                    color: '#7B5EA8',
                    fontSize: 9
                }
            });
        cinit('ch-allsites', {
            ...BASE,
            grid: {
                left: 200,
                right: 80,
                top: 14,
                bottom: 28
            },
            legend: {
                show: false
            },
            dataZoom: [],
            tooltip: {
                ...BASE.tooltip,
                trigger: 'item',
                formatter: p => {
                    // Use the display-order array since the chart's data is reversed for visual
                    // rendering — indexing into the original sorted-ascending list would mismatch.
                    const r = displayRows[p.dataIndex];
                    if (!r)
                        return '';
                    return `<strong>${esc(r.domain)}</strong>${r.isTarget ? ' <span style="color:#27AAE1">[target]</span>' : ''}<br>Activity: <strong>${esc(r.activityClass)}</strong><br>Before avg: <strong>${rk.fmt(r.bVal)}</strong> ${rk.unit}<br>After avg: <strong>${rk.fmt(r.aVal)}</strong> ${rk.unit}<br>Change: <strong style="color:${r.rankCh < 0 ? '#2D9E5A' : '#C0392B'}">${signStr(r.rankCh)}</strong> (${r.rankAbs >= 0 ? '+' : ''}${rk.fmt(r.rankAbs)})`;
                }
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    color: 'var(--text-faint)',
                    fontSize: 10,
                    formatter: v => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`
                },
                splitLine: {
                    lineStyle: {
                        color: themeChartColors().grid
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: labels,
                axisLabel: {
                    color: themeChartColors().text,
                    fontSize: 10.5,
                    formatter: v => v
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: [{
                type: 'bar',
                data: values.map( (v, i) => ({
                    value: v,
                    itemStyle: {
                        color: colors[i],
                        borderRadius: [2, 2, 2, 2]
                    }
                })),
                barMaxWidth: 14,
                label: {
                    show: true,
                    position: 'right',
                    formatter: p => `${p.value > 0 ? '+' : ''}${p.value.toFixed(1)}%`,
                    fontSize: 10,
                    color: themeChartColors().text
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    data: markLineData
                }
            }]
        });
    }
    ;

    const buildSummTxt = (cmp, target, fixDate, ctrlDoms, interp, focus = 'auto') => {
        const pad = (s, n) => String(s).padEnd(n);
        const data = S.data || {};
        const focusMode = focus !== 'auto' && focus !== 'cpu';
        // Focus headline block — leads the copyable report with the metric the user chose,
        // run as a DiD on THAT metric (not CPU), so the text never contradicts the report title.
        const focusLines = ( () => {
            if (!focusMode)
                return [];
            const dash = '─'.repeat(72);
            const ls = [``, `FIX FOCUS — ${(FOCUS_LABELS[focus] || focus).toUpperCase()}`, dash];
            if (focus === 'cost' || focus === 'execs') {
                if (!data.hasExec)
                    return [...ls, `Execution data unavailable — cannot compute this metric.`];
                const lens = focus === 'cost' ? cmp.lenses.perExec : cmp.lenses.exec;
                const fmtv = focus === 'cost' ? (v => v === null ? '—' : fmtD(v, 3)) : (v => v === null ? '—' : fmtN(v));
                const unit = focus === 'cost' ? 'sec/req' : 'req/day';
                const did = (lens.tgtCh !== null && lens.netCh !== null) ? lens.tgtCh - lens.netCh : null;
                ls.push(`Target                  ${signStr(lens.tgtCh).padEnd(10)}  ${fmtv(lens.tgtBefore)} -> ${fmtv(lens.tgtAfter)} ${unit}`, `Network (${String(cmp.networkDoms.length).padStart(2)} sites)        ${signStr(lens.netCh).padEnd(10)}  ${fmtv(lens.netBefore)} -> ${fmtv(lens.netAfter)} ${unit}`, `NET EFFECT vs network   ${did === null ? '—' : (did >= 0 ? '+' : '') + did.toFixed(1) + ' pp'}`);
                const fs = focusSeries(cmp, focus);
                const st = fs && fs.b.length >= 2 && fs.a.length >= 2 ? welchT(fs.b, fs.a) : null;
                if (st)
                    ls.push(`Welch's t-test:         p=${st.p < 0.001 ? '<0.001' : st.p.toFixed(3)}, df=${st.df.toFixed(1)} (${st.p < 0.05 ? 'significant' : 'not significant'})`);
            } else if (focus === 'memory' || focus === 'cores') {
                const isMem = focus === 'memory';
                const bAvg = avgAll(isMem ? cmp.mB : cmp.kB), aAvg = avgAll(isMem ? cmp.mA : cmp.kA);
                const ch = pctCh(bAvg, aAvg);
                const unit = isMem ? 'GB' : 'cores';
                ls.push(`${pad(isMem ? 'Account memory' : 'Cores in use', 24)}${signStr(ch).padEnd(10)}  ${fmtD(bAvg, 2)} -> ${fmtD(aAvg, 2)} ${unit}/day`, `(Per-site ${isMem ? 'memory' : 'cores'} not reported by SiteGround — attribution via CPU share)`);
            } else if (focus === 'combo') {
                const row = (lbl, lens) => {
                    if (!lens || lens.tgtCh === null)
                        return;
                    const did = (lens.tgtCh !== null && lens.netCh !== null) ? lens.tgtCh - lens.netCh : null;
                    ls.push(`${pad(lbl, 16)} tgt ${signStr(lens.tgtCh).padEnd(9)} net ${signStr(lens.netCh).padEnd(9)} DiD ${did === null ? '—' : (did >= 0 ? '+' : '') + did.toFixed(1) + 'pp'}`);
                }
                ;
                if (data.hasExec) {
                    row('Cost/request', cmp.lenses.perExec);
                    row('Volume', cmp.lenses.exec);
                }
                row('CPU time', cmp.lenses.cpu);
                if (data.hasMem) {
                    const mb = avgAll(cmp.mB), ma = avgAll(cmp.mA);
                    ls.push(`${pad('Memory (srv)', 16)} ${signStr(pctCh(mb, ma))}  ${fmtD(mb, 2)} -> ${fmtD(ma, 2)} GB`);
                }
                const kb = avgAll(cmp.kB), ka = avgAll(cmp.kA);
                ls.push(`${pad('Cores (srv)', 16)} ${signStr(pctCh(kb, ka))}  ${fmtD(kb, 2)} -> ${fmtD(ka, 2)}`);
            }
            return ls;
        }
        )();
        const credLines = [];
        if (cmp.credibility) {
            credLines.push(``, `CREDIBILITY: ${cmp.credibility.score}/100 (${cmp.credibility.verdict})`, '─'.repeat(72));
            if (cmp.credibility.reasons.length)
                cmp.credibility.reasons.forEach(r => credLines.push(`  - ${r}`));
            if (cmp.planStraddles?.length)
                cmp.planStraddles.forEach(p => credLines.push(`  ! PLAN CHANGE INSIDE WINDOW: ${p.kind} ${p.fromVal}->${p.toVal} on ${p.date}`));
        }
        // Verdicts are graded against the SELECTED comparison group (baseline). Label "Network"
        // only when the selected group IS the whole network; otherwise name it the baseline.
        const baseTxt = cmp.ctrlIsNetwork ? 'Network' : 'Baseline';
        const baseVs = cmp.ctrlIsNetwork ? 'network' : 'baseline';
        const pairedLines = [];
        if (cmp.netEffectPctPaired !== null && cmp.tBPaired.length >= 2) {
            const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            pairedLines.push(``, `WEEKDAY-PAIRED DiD (${cmp.tBPaired.length} matched pairs, weekdays: ${cmp.dowsCovered.map(d => dows[d]).join(',') || '-'})`, '─'.repeat(72), `Target (paired)         ${signStr(cmp.targetPctChPaired).padEnd(10)}  ${fmtN(cmp.tBPAvg)} -> ${fmtN(cmp.tAPAvg)} CPU sec/day`, `${pad(baseTxt + ' (paired)', 24)}${signStr(cmp.baselinePctChPaired).padEnd(10)}  ${fmtN(cmp.cBPAvg)} -> ${fmtN(cmp.cAPAvg)} CPU sec/day`, `Net effect (paired)     ${(cmp.netEffectPctPaired >= 0 ? '+' : '') + cmp.netEffectPctPaired.toFixed(1)} pp`);
            if (cmp.statResid)
                pairedLines.push(`DiD residual t-test:    p=${cmp.statResid.p < 0.001 ? '<0.001' : cmp.statResid.p.toFixed(3)}, df=${cmp.statResid.df.toFixed(1)}${cmp.statResid.p < 0.05 ? ' (significant isolated effect)' : ' (not statistically significant)'}`);
        }
        const didLines = [];
        if (cmp.netEffectPct !== null) {
            didLines.push(``, `NET EFFECT (Difference-in-Differences)`, '─'.repeat(72), `Target change           ${signStr(cmp.targetPctCh).padEnd(10)}  ${fmtN(cmp.tAvgB)} -> ${fmtN(cmp.tAvgA)} CPU sec/day`, `${pad(baseTxt + ' change (' + cmp.ctrlDoms.length + ')', 24)}${signStr(cmp.baselinePctCh).padEnd(10)}  ${fmtN(cmp.cAvgB)} -> ${fmtN(cmp.cAvgA)} CPU sec/day`, `NET EFFECT vs ${baseVs}${baseVs === 'network' ? '   ' : '  '} ${(cmp.netEffectPct >= 0 ? '+' : '') + cmp.netEffectPct.toFixed(1)} pp`);
            if (cmp.expectedAfter !== null && cmp.savedCpuPerDay !== null) {
                didLines.push(`Expected after (counterfactual): ${fmtN(cmp.expectedAfter)} CPU sec/day`, `Actual after:                     ${fmtN(cmp.tAvgA)} CPU sec/day`, `Net ${cmp.savedCpuPerDay >= 0 ? 'saving' : 'loss'} vs counterfactual:    ${fmtN(Math.abs(cmp.savedCpuPerDay))} CPU sec/day`);
            }
            if (!cmp.ctrlIsNetwork && cmp.netEffectPctVsNetwork !== null) {
                didLines.push(`(Context — vs whole network of ${cmp.networkDoms.length}: ${fmtN(cmp.nAvgB)} -> ${fmtN(cmp.nAvgA)}, net effect ${(cmp.netEffectPctVsNetwork >= 0 ? '+' : '') + cmp.netEffectPctVsNetwork.toFixed(1)} pp)`);
            }
            if (cmp.targetRank > 0) {
                didLines.push(`Target rank: #${cmp.targetRank} of ${cmp.perSite.length} sites${cmp.targetPercentile !== null ? ` (improved more than ${cmp.targetPercentile.toFixed(0)}% of peers)` : ''}`);
            }
        }
        const rankRows = cmp.sortedByChange.slice(0, 10).map( (r, i) => `${('#' + (i + 1)).padEnd(4)} ${pad(r.activityClass, 8)} ${pad(r.domain, 38)} ${pad(fmtN(r.bAvg), 10)} -> ${pad(fmtN(r.aAvg), 10)} ${signStr(r.pctCh)}${r.isTarget ? '  <- TARGET' : ''}`);
        // Brand banner + footer for the clipboard text. Used by Copy Summary.
        const heavy = '━'.repeat(72);
        const reportTitle = focusMode ? `  SiteGround ${FOCUS_LABELS[focus] || 'Analysis'} Report` : '  SiteGround CPU Analysis Report';
        const brandHead = ['', heavy, '  COBBLESTONE LEARNING — LEARNING · CREATIVITY · TRUST', reportTitle, heavy, ''];
        const brandFoot = ['', heavy, '  Cobblestone Learning, 5 Lombard Street, Dublin 2, Ireland', '  info@cobblestonelearning.com · +353 1 908 1582 · www.cobblestonelearning.com', heavy];
        // In focus mode the CPU-centric DiD / Welch / weekday-paired blocks are suppressed —
        // they refer to CPU time, the wrong metric for a cost/exec/memory/cores report, and would
        // contradict the headline. focusLines carries the right numbers. CPU + auto keep full detail.
        const allDidLines = focusMode ? [...credLines, ...focusLines] : [...credLines, ...(cmp.stat ? [``, `Welch's t-test (raw target): p=${cmp.stat.p < 0.001 ? '<0.001' : cmp.stat.p.toFixed(3)}, df=${cmp.stat.df.toFixed(1)}, diff=${fmtN(cmp.stat.diff)} CPU sec/day, 95% CI [${fmtN(cmp.stat.ci95[0])}, ${fmtN(cmp.stat.ci95[1])}]`] : []), ...didLines, ...pairedLines, ];
        return [...brandHead, `Site analysed: ${target}`, `Generated:     ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`, `Fix:           ${fixDate}  Before: ${cmp.bStart}→${cmp.bEnd} (${cmp.bDates.length} days)  After: ${cmp.aStart}→${cmp.aEnd} (${cmp.aDates.length} days)`, `Control: ${ctrlDoms.join(', ')}`, ...allDidLines, ``, `METRIC                          BEFORE           AFTER            CHANGE`, '\u2500'.repeat(72), ...cmp.metrics.map(m => `${pad(m.title, 32)}${pad(m.fmt(m.before) + ' ' + m.unit, 17)}${pad(m.fmt(m.after) + ' ' + m.unit, 17)}${signStr(pctCh(m.before, m.after))}`), ...(rankRows.length ? [``, `TOP 10 MOST-IMPROVED SITES`, '\u2500'.repeat(72), ...rankRows] : []), ``, `INTERPRETATION`, '\u2500'.repeat(72), ...interp.map(l => l.replace(/<[^>]+>/g, '')), ...brandFoot].join('\n');
    }
    ;

    // ── BRANDED DOCUMENT TEMPLATE ─────────────────────────────────────────────
    // Shared scaffolding for every printable Cobblestone document: A4 page, 0 margin,
    // thead/tfoot repeating header/footer JPEGs, brand-spec CSS. Inner-body content varies.
    const brandDocCSS = `
@page { size: A4; margin: 0; }
*  { box-sizing: border-box; }
body { margin: 0; font-family: 'Montserrat', Helvetica, Arial, sans-serif; color: #3D3D3D; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#pw { width: 100%; border-collapse: collapse; border-spacing: 0; }
#pw thead { display: table-header-group; }
#pw tfoot { display: table-footer-group; }
#pw tbody { display: table-row-group; }
#pw thead td { padding: 0 0 14mm 0; }
#pw tfoot td { padding: 10mm 0 0 0; }
#pw tbody td { padding: 0 18mm; vertical-align: top; }
#pw img.hf { width: 100%; display: block; margin: 0; padding: 0; }
h1 { font-size: 22pt; font-weight: 700; color: #27AAE1; margin: 0 0 6pt; letter-spacing: -.01em; }
h2 { font-size: 14pt; font-weight: 700; color: #3D3D3D; margin: 20pt 0 9pt; padding: 0 0 6pt; border-bottom: 2pt solid #27AAE1; letter-spacing: -.005em; }
.cover-meta { font-size: 9.5pt; color: #555; line-height: 1.7; margin: 0 0 18pt; }
.cover-meta strong { color: #1f1f1f; }
.section-intro { font-size: 9.5pt; color: #555; line-height: 1.6; margin-bottom: 10pt; font-style: italic; }
.kv { font-size: 9.5pt; color: #555; margin: 4pt 0; }
.kv strong { color: #1f1f1f; }
table.data { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 8pt 0; }
table.data thead td { background: #27AAE1; color: #fff; font-weight: 700; padding: 7pt 8pt; font-size: 8pt; text-transform: uppercase; letter-spacing: .4pt; }
.card { background: #fff; border: 1pt solid #E8ECF0; padding: 14pt 18pt; margin-bottom: 14pt; }
.card.accent { border-top: 3pt solid #27AAE1; }
.card.alt { background: #F8F9FB; }
.lbl { font-size: 8.5pt; font-weight: 700; color: #939393; text-transform: uppercase; letter-spacing: .5pt; margin-bottom: 6pt; }
.big { font-size: 28pt; font-weight: 800; line-height: 1; letter-spacing: -.02em; margin-bottom: 5pt; }
.med { font-size: 16pt; font-weight: 800; line-height: 1; }
.sub { font-size: 9pt; color: #555; line-height: 1.55; }
.foot-note { font-size: 8pt; color: #939393; margin-top: 6pt; font-style: italic; }
.row { display: flex; gap: 18pt; align-items: flex-start; }
.row > div { flex: 1; }
.alert-line { font-size: 9.5pt; padding: 7pt 10pt; margin-bottom: 5pt; border-radius: 3pt; line-height: 1.5; }
.alert-line.ok { background: #F0FAF3; border-left: 3pt solid #2D9E5A; color: #1B6E3E; }
.alert-line.warn { background: #FFF8E1; border-left: 3pt solid #8A6500; color: #6E4A00; }
.alert-line.crit { background: #FCEAE7; border-left: 3pt solid #C0392B; color: #7F2419; }
ul.bul { padding: 0; margin: 0; list-style: none; }
ul.bul li { font-size: 9.5pt; color: #3D3D3D; line-height: 1.6; padding-left: 14pt; position: relative; margin-bottom: 6pt; }
ul.bul li::before { content: '•'; position: absolute; left: 0; color: #27AAE1; font-weight: 700; }
.brand-foot { margin-top: 24pt; padding-top: 12pt; border-top: 1pt solid #E8ECF0; font-size: 8pt; color: #939393; line-height: 1.5; }
.brand-foot strong { color: #3D3D3D; }
@media print { .no-print { display: none; } }
.no-print { position: fixed; top: 12pt; right: 12pt; background: #27AAE1; color: #fff; padding: 8pt 14pt; border: 0; border-radius: 6pt; font-family: inherit; font-size: 10pt; font-weight: 700; cursor: pointer; box-shadow: 0 4pt 14pt rgba(39,170,225,.25); z-index: 9999; }
`;
    const brandDocFooter = `<div class="brand-foot"><strong>Cobblestone Learning</strong> · 5 Lombard Street, Dublin 2, Ireland · +353 1 908 1582 · info@cobblestonelearning.com<br>Generated by the SiteGround Reports dashboard. All metrics on this report (CPU seconds, executions, cores in use, GB used) are absolute measurements — plan-immune by construction, comparable across any plan change in the analysis window.</div>`;
    const openBrandDoc = (title, innerHtml) => {
        const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><title>${esc(title)} — Cobblestone Learning</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>${brandDocCSS}</style>
</head><body>
<button class="no-print" onclick="window.print()">🖨 Print / Save as PDF</button>
<table id="pw">
  <thead><tr><td><img class="hf" src="${CBL_HDR_JPEG}" alt="Cobblestone Learning"></td></tr></thead>
  <tfoot><tr><td><img class="hf" src="${CBL_FTRD_JPEG}" alt=""></td></tr></tfoot>
  <tbody><tr><td>${innerHtml}${brandDocFooter}</td></tr></tbody>
</table>
<script>window.addEventListener('load', function() {
  try { var A4 = Math.round(297/25.4*96); var pw = document.getElementById('pw');
    var rem = pw.offsetHeight % A4;
    if (rem > 40) { var sp = document.createElement('tr');
      sp.innerHTML = '<td style="height:' + (A4-rem) + 'px"></td>';
      pw.querySelector('tbody').appendChild(sp); }
  } catch(e) {}
  setTimeout(function() { window.print(); }, 900);
});</script>
</body></html>`;
        const w = window.open('', '_blank');
        if (!w) {
            alert('Pop-up blocked. Allow pop-ups for SiteGround Site Tools to generate the report.');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }
    ;

    // ── BRANDED HEALTH SNAPSHOT REPORT ────────────────────────────────────────
    const generateHealthReport = (data) => {
        const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        const h = buildHourlyData();
        const alerts = buildAlerts(data, h);
        const {score, parts} = computeHealthScore(data, alerts);
        const lvl = score >= 75 ? 'ok' : score >= 45 ? 'warn' : 'crit';
        const lvlLabel = lvl === 'ok' ? 'Healthy' : lvl === 'warn' ? 'Elevated' : 'Under Pressure';
        const scoreColor = lvl === 'ok' ? '#2D9E5A' : lvl === 'warn' ? '#8A6500' : '#C0392B';
        const suspect = findPrimarySuspect(data, h);
        const liveCores = getLiveCores();
        const limit = getCoreLimit();
        const liveMemGb = getLiveMemGb();
        const memLimGb = getMemLimit();
        const coresFree = (liveCores !== null && limit) ? Math.max(0, limit - liveCores) : null;
        const coresFreePct = (liveCores !== null && limit) ? Math.max(0, 100 - (liveCores / limit) * 100) : null;
        const memFreeGb = (liveMemGb !== null && memLimGb) ? Math.max(0, memLimGb - liveMemGb) : null;
        const memUsedPct = (liveMemGb !== null && memLimGb) ? (liveMemGb / memLimGb) * 100 : null;
        const trajBit = data.coreProj?.reg ? `${data.coreProj.reg.slope > 0 ? '+' : ''}${data.coreProj.reg.slope.toFixed(3)} cores/d · → ${(limit * 0.75).toFixed(2)} cores in ${data.coreProj.daysTo75 ? data.coreProj.daysTo75.toFixed(1) + 'd' : '—'}${data.coreProj.ci?.daysLo && data.coreProj.ci?.daysHi ? ` (95% CI ${data.coreProj.ci.daysLo.toFixed(0)}–${data.coreProj.ci.daysHi.toFixed(0)}d)` : ''}` : '—';
        const alertsHtml = alerts.length ? alerts.map(a => `<div class="alert-line ${a.lvl}">${a.msg}</div>`).join('') : '<div class="alert-line ok">No anomalies detected. Server appears healthy.</div>';
        const topComposition = h ? h.sites.map(s => ({
            d: s.domain,
            v: lastCompleteHourly(s.points)
        })).filter(x => x.v > 0).sort( (a, b) => b.v - a.v).slice(0, 8) : [];
        const compTotal = topComposition.reduce( (s, x) => s + x.v, 0);
        const compRows = topComposition.map(seg => `<tr><td style="width:60%;padding:6pt 10pt;font-size:9.5pt;border-bottom:1px solid #E8ECF0;">${esc(seg.d)}</td><td style="width:20%;padding:6pt 10pt;text-align:right;font-size:9.5pt;color:#3D3D3D;font-variant-numeric:tabular-nums;border-bottom:1px solid #E8ECF0;">${fmtN(seg.v)}</td><td style="width:20%;padding:6pt 10pt;text-align:right;font-size:9.5pt;color:#0074B4;font-weight:600;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtD((seg.v / compTotal) * 100, 1)}%</td></tr>`).join('');
        const inner = `
    <h1>Server Health Snapshot</h1>
    <div class="cover-meta">
      <strong>Plan:</strong> ${data.currentCoreLimit} cores, ${data.currentMemLimitGb ?? '?'}GB memory<br>
      <strong>Window:</strong> ${data.dates[0]} → ${data.dates[data.dates.length - 1]} (${data.dates.length} days)<br>
      <strong>Active sites:</strong> ${data.activeSites?.length ?? '?'} · <strong>Dead/parked:</strong> ${data.deadSites?.length ?? '?'} · <strong>Excluded by user:</strong> ${S.ui.excludedSites.size}<br>
      <strong>Generated:</strong> ${stamp}
    </div>
    <h2>Headline</h2>
    <div class="card accent">
      <div class="row">
        <div>
          <div class="lbl">Health score</div>
          <div class="big" style="color:${scoreColor}">${score}<span style="font-size:14pt;color:#939393;font-weight:600">/100 · ${lvlLabel}</span></div>
          <div class="sub">Capacity ${Math.round(parts.capacity)}/40 · Trend ${Math.round(parts.trend)}/20 · Anomalies ${Math.round(parts.anomalies)}/20 · Memory ${Math.round(parts.memory)}/10 · Concentration ${Math.round(parts.concentration)}/10</div>
        </div>
        <div>
          <div class="lbl">Cores in use</div>
          <div class="med" style="color:${coresFreePct === null ? '#939393' : coresFreePct > 50 ? '#2D9E5A' : coresFreePct > 25 ? '#8A6500' : '#C0392B'}">${liveCores !== null ? liveCores.toFixed(2) + ' / ' + limit : '—'}<span style="font-size:10pt;color:#939393;font-weight:600"> cores</span></div>
          <div class="sub"><strong>${coresFree !== null ? coresFree.toFixed(2) + ' cores free' : '—'}</strong>${coresFreePct !== null ? ` · ${(100 - coresFreePct).toFixed(0)}% of plan` : ''}</div>
        </div>
        <div>
          <div class="lbl">Memory in use</div>
          <div class="med" style="color:${memUsedPct === null ? '#939393' : memUsedPct < 50 ? '#2D9E5A' : memUsedPct < 75 ? '#8A6500' : '#C0392B'}">${liveMemGb !== null ? liveMemGb.toFixed(2) + ' / ' + (memLimGb ?? '?') : '—'}<span style="font-size:10pt;color:#939393;font-weight:600"> GB</span></div>
          <div class="sub"><strong>${memFreeGb !== null ? memFreeGb.toFixed(2) + ' GB free' : '—'}</strong>${memUsedPct !== null ? ` · ${memUsedPct.toFixed(0)}% of plan` : ''}</div>
        </div>
      </div>
      <div style="margin-top:12pt;padding-top:10pt;border-top:1pt dashed #E8ECF0;font-size:9.5pt;color:#555">
        <strong>7-day trajectory:</strong> ${trajBit}
      </div>
    </div>
    ${suspect && suspect.score > 0 ? `
      <h2>Primary suspect</h2>
      <div class="card alt">
        <div class="kv"><strong>${esc(suspect.domain)}</strong> · score ${suspect.score.toFixed(0)} · last-hour CPU <strong>${fmtN(suspect.lastHr)}</strong> · share <strong>${fmtD(suspect.share, 1)}%</strong> · ratio vs own baseline <strong>${fmtD(suspect.ratio, 1)}×</strong></div>
        ${suspect.why ? `<div class="sub" style="margin-top:6pt">${esc(suspect.why)}</div>` : ''}
      </div>
    ` : ''}
    <h2>Alerts &amp; Signals</h2>
    <p class="section-intro">Automatic flags raised from current vs. historical behaviour. Sorted by severity.</p>
    ${alertsHtml}
    ${topComposition.length ? `
      <h2>Right-now site composition</h2>
      <p class="section-intro">Share of the last complete hour by site (top 8). Total: ${fmtN(compTotal)} CPU sec.</p>
      <table class="data">
        <thead><tr><td style="width:60%;text-align:left">Site</td><td style="width:20%;text-align:right">CPU sec (last hour)</td><td style="width:20%;text-align:right">Share</td></tr></thead>
        <tbody>${compRows}</tbody>
      </table>
    ` : ''}
  `;
        openBrandDoc('Server Health Snapshot', inner);
    }
    ;

    // ── BRANDED SITES OVERVIEW REPORT ─────────────────────────────────────────
    const generateSitesReport = (data) => {
        const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        const totalAcct = data.acctTotal;
        const sites = data.siteStats.filter(s => s.total > 0 && !s.isExcluded);
        const topSites = sites.slice(0, 20);
        const rows = topSites.map( (s, i) => {
            const trendColor = s.trend7 === null ? '#939393' : s.trend7 < -5 ? '#2D9E5A' : s.trend7 > 20 ? '#C0392B' : '#0074B4';
            const cpuExBit = s.cpuPerExec ? `<span style="color:#555">${fmtD(s.cpuPerExec, 2)}</span>` : '<span style="color:#939393">—</span>';
            const burstBit = (s.burstScore !== undefined) ? `<span style="background:${s.burstScore > 25 ? '#FCEAE7' : s.burstScore > 10 ? '#FFF8E1' : '#F0FAF3'};color:${s.burstScore > 25 ? '#C0392B' : s.burstScore > 10 ? '#8A6500' : '#2D9E5A'};padding:1pt 7pt;border-radius:8pt;font-size:8pt;font-weight:700;">${s.burstScore.toFixed(0)}%</span>` : '<span style="color:#939393">—</span>';
            return `<tr>
        <td style="width:5%;padding:6pt 8pt;text-align:right;color:#939393;font-size:9pt;border-bottom:1px solid #E8ECF0;">#${i + 1}</td>
        <td style="width:32%;padding:6pt 8pt;font-size:9.5pt;border-bottom:1px solid #E8ECF0;">${esc(s.domain)}</td>
        <td style="width:11%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#3D3D3D;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtN(s.total)}</td>
        <td style="width:9%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#555;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtN(s.avg)}</td>
        <td style="width:9%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#555;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtN(s.avg7)}</td>
        <td style="width:9%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#C0392B;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtN(s.peak)}</td>
        <td style="width:7%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#0074B4;font-weight:600;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtD(s.shareOfAccount, 1)}%</td>
        <td style="width:7%;padding:6pt 8pt;text-align:right;font-size:9.5pt;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${cpuExBit}</td>
        <td style="width:6%;padding:6pt 8pt;text-align:right;border-bottom:1px solid #E8ECF0;">${burstBit}</td>
        <td style="width:6%;padding:6pt 8pt;text-align:right;font-size:9.5pt;font-weight:700;color:${trendColor};border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${s.trend7 === null ? '—' : signStr(s.trend7)}</td>
      </tr>`;
        }
        ).join('');
        const dead = data.deadSites || [];
        const deadHtml = dead.length ? `<h2>Dead / parked sites</h2><p class="section-intro">Sites on the account with zero CPU activity over the captured window. Excluded from rankings.</p><ul class="bul">${dead.slice(0, 30).map(d => `<li>${esc(d)}</li>`).join('')}${dead.length > 30 ? `<li style="color:#939393;font-style:italic">…and ${dead.length - 30} more</li>` : ''}</ul>` : '';
        const inner = `
    <h1>Sites Overview</h1>
    <div class="cover-meta">
      <strong>Window:</strong> ${data.dates[0]} → ${data.dates[data.dates.length - 1]} (${data.dates.length} days)<br>
      <strong>Active sites:</strong> ${sites.length} (showing top ${topSites.length}) · <strong>Dead/parked:</strong> ${dead.length} · <strong>Excluded by user:</strong> ${S.ui.excludedSites.size}<br>
      <strong>Account total CPU:</strong> ${fmtN(totalAcct)} CPU sec<br>
      <strong>Generated:</strong> ${stamp}
    </div>
    <h2>Top sites by 30-day CPU</h2>
    <p class="section-intro">Ranked by total CPU consumed. Trend column compares last 7 days to the prior 7 (green = improving, red = climbing).</p>
    <table class="data">
      <thead><tr>
        <td style="width:5%;text-align:right">#</td>
        <td style="width:32%;text-align:left">Site</td>
        <td style="width:11%;text-align:right">Total CPU</td>
        <td style="width:9%;text-align:right">Avg/Day</td>
        <td style="width:9%;text-align:right">7d Avg</td>
        <td style="width:9%;text-align:right">Peak</td>
        <td style="width:7%;text-align:right">% Acct</td>
        <td style="width:7%;text-align:right">CPU/Exec</td>
        <td style="width:6%;text-align:right">Burst</td>
        <td style="width:6%;text-align:right">7d Δ</td>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${deadHtml}
  `;
        openBrandDoc('Sites Overview', inner);
    }
    ;

    // ── BRANDED REPORT GENERATOR (Before/After) ──────────────────────────────
    // Opens a new browser tab containing a print-ready Cobblestone-branded report of the
    // current Before/After analysis. Implements the brand's PDF spec exactly:
    //   • A4 size, 0 page margin, full-width header/footer JPEGs via thead/tfoot
    //   • Montserrat throughout, cyan #27AAE1 section accents, Cobblestone footer marks
    //   • Inline-styled tables (Chrome's print engine ignores most external CSS classes
    //     between thead/tbody — inline styles are the only reliable cross-page method)
    //   • Auto-triggers window.print() after the page settles
    const generateBrandedReport = (data, cmp, target, fixDate, ctrlDoms, interp) => {
        const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const site = target.split('.')[0];
        const planLine = data.planChanges?.length ? `<p style="margin:6pt 0 0;font-size:9pt;color:#0074B4">ℹ Plan upgrade during window: ${data.planChanges.map(c => `${c.kind === 'mem' ? 'memory' : 'cores'} ${c.fromVal}→${c.toVal}${c.kind === 'mem' ? 'GB' : ''} on ${c.date}`).join('; ')} — every metric is in absolute units (cores in use, GB used, CPU sec) so the comparison is plan-immune.</p>` : '';
        // The DiD verdict is graded against the SELECTED comparison group (baseline). When that
        // group is the whole network the wording stays "network".
        const baseIsNet = !!cmp.ctrlIsNetwork;
        const baseWord = baseIsNet ? 'the network' : 'your selected peers';
        const baseTitle = baseIsNet ? 'Network' : 'Selected peers';
        // Headline pp number — sign-coloured per brand (green good, red bad, amber neutral).
        const heroColor = cmp.netEffectPct === null ? '#939393' : cmp.netEffectPct <= -10 ? '#2D9E5A' : cmp.netEffectPct >= 10 ? '#C0392B' : cmp.netEffectPct <= -5 ? '#0074B4' : '#8A6500';
        const heroLabel = cmp.netEffectPct === null ? '—' : `${cmp.netEffectPct > 0 ? '+' : ''}${cmp.netEffectPct.toFixed(1)} pp`;
        const verdict = cmp.netEffectPct === null ? 'Insufficient data' : cmp.netEffectPct <= -15 ? 'Strong isolated fix effect' : cmp.netEffectPct < -5 ? 'Modest isolated effect' : Math.abs(cmp.netEffectPct) <= 5 ? `Target moved with ${baseWord} — no isolated effect` : cmp.netEffectPct > 5 ? `Target underperformed ${baseWord}` : '';
        // Credibility colour
        const credColor = !cmp.credibility ? '#939393' : cmp.credibility.score >= 75 ? '#2D9E5A' : cmp.credibility.score >= 50 ? '#8A6500' : '#C0392B';
        // Ranking rows — top 12 to keep one page tight; full list still available in the dashboard.
        const rankRows = cmp.sortedByChange.slice(0, 14).map( (r, i) => `<tr><td style="width:6%;padding:6pt 8pt;text-align:right;color:#939393;font-size:9pt;border-bottom:1px solid #E8ECF0;">#${i + 1}</td><td style="width:46%;padding:6pt 8pt;font-size:9.5pt;border-bottom:1px solid #E8ECF0;${r.isTarget ? 'background:rgba(39,170,225,0.08);font-weight:600;border-left:3px solid #27AAE1;padding-left:9pt;' : ''}">${esc(r.domain)}${r.isTarget ? ' <span style="background:#27AAE1;color:#fff;font-size:7pt;font-weight:700;padding:1pt 6pt;border-radius:8pt;text-transform:uppercase;letter-spacing:.3pt;margin-left:6pt;">target</span>' : ''}</td><td style="width:12%;padding:6pt 8pt;text-align:left;font-size:8.5pt;color:#555;border-bottom:1px solid #E8ECF0;"><span style="background:${r.activityClass === 'GREW' ? '#FCEAE7' : r.activityClass === 'SHRANK' ? '#F0FAF3' : '#F0F2F5'};color:${r.activityClass === 'GREW' ? '#C0392B' : r.activityClass === 'SHRANK' ? '#2D9E5A' : '#555'};padding:2pt 7pt;border-radius:8pt;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.3pt;">${r.activityClass.toLowerCase()}</span></td><td style="width:12%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#3D3D3D;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtN(r.bAvg)}</td><td style="width:12%;padding:6pt 8pt;text-align:right;font-size:9.5pt;color:#3D3D3D;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${fmtN(r.aAvg)}</td><td style="width:12%;padding:6pt 8pt;text-align:right;font-size:10pt;font-weight:700;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;color:${r.pctCh < 0 ? '#2D9E5A' : r.pctCh > 0 ? '#C0392B' : '#3D3D3D'};">${signStr(r.pctCh)}</td></tr>`).join('');
        // Comparison metrics table
        const metricsRows = cmp.metrics.map(m => {
            const ch = pctCh(m.before, m.after);
            const chColor = m.neutral ? '#0074B4' : ch === null ? '#939393' : ch < 0 ? '#2D9E5A' : ch > 0 ? '#C0392B' : '#3D3D3D';
            return `<tr><td style="width:42%;padding:7pt 10pt;font-size:9.5pt;color:#3D3D3D;border-bottom:1px solid #E8ECF0;">${esc(m.title)}</td><td style="width:24%;padding:7pt 10pt;text-align:right;font-size:9.5pt;color:#555;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;">${m.fmt(m.before)} <span style="color:#939393;font-size:8.5pt">${esc(m.unit)}</span></td><td style="width:24%;padding:7pt 10pt;text-align:right;font-size:9.5pt;color:#3D3D3D;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;font-weight:600;">${m.fmt(m.after)} <span style="color:#939393;font-size:8.5pt">${esc(m.unit)}</span></td><td style="width:10%;padding:7pt 10pt;text-align:right;font-size:10pt;font-weight:700;border-bottom:1px solid #E8ECF0;font-variant-numeric:tabular-nums;color:${chColor};">${signStr(ch)}</td></tr>`;
        }
        ).join('');
        // Interpretation list — strip the dashboard's HTML tags but preserve emphasis via simple styling.
        const interpItems = interp.map(line => {
            const clean = line.replace(/<strong>/g, '<span style="font-weight:700;color:#1f1f1f">').replace(/<\/strong>/g, '</span>').replace(/<em>/g, '<span style="font-style:italic">').replace(/<\/em>/g, '</span>');
            return `<li style="margin-bottom:7pt;line-height:1.55;color:#3D3D3D;font-size:10pt;padding-left:14pt;position:relative;list-style:none;"><span style="position:absolute;left:0;top:0;color:#27AAE1;font-weight:700;">•</span>${clean}</li>`;
        }
        ).join('');
        // Compose the page. Per brand spec: `<table id="pw">` wraps everything; thead/tfoot
        // hold the brand images and Chrome's print engine repeats them on every page.
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SiteGround Report — ${esc(target)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 0; }
*  { box-sizing: border-box; }
body { margin: 0; font-family: 'Montserrat', Helvetica, Arial, sans-serif; color: #3D3D3D; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
/* Per brand spec: wrap everything in #pw, use thead/tfoot for repeating page header/footer */
#pw { width: 100%; border-collapse: collapse; border-spacing: 0; }
#pw thead { display: table-header-group; }
#pw tfoot { display: table-footer-group; }
#pw tbody { display: table-row-group; }
#pw thead td { padding: 0 0 14mm 0; }
#pw tfoot td { padding: 10mm 0 0 0; }
#pw tbody td { padding: 0 18mm; vertical-align: top; }
#pw img.hf { width: 100%; display: block; margin: 0; padding: 0; }
h1 { font-size: 22pt; font-weight: 700; color: #27AAE1; margin: 0 0 6pt; letter-spacing: -.01em; }
h2 { font-size: 14pt; font-weight: 700; color: #3D3D3D; margin: 18pt 0 8pt; padding: 0 0 5pt; border-bottom: 2pt solid #27AAE1; letter-spacing: -.005em; }
.cover-meta { font-size: 9.5pt; color: #555; line-height: 1.65; margin: 0 0 18pt; }
.cover-meta strong { color: #1f1f1f; }
.hero { background: #fff; border: 1pt solid #E8ECF0; border-top: 3pt solid #27AAE1; padding: 18pt 22pt; margin: 12pt 0 18pt; }
.hero-row { display: flex; gap: 24pt; align-items: flex-start; }
.hero-cell { flex: 1; }
.hero-lbl { font-size: 8.5pt; font-weight: 700; color: #939393; text-transform: uppercase; letter-spacing: .5pt; margin-bottom: 6pt; }
.hero-big { font-size: 28pt; font-weight: 800; line-height: 1; letter-spacing: -.02em; margin-bottom: 5pt; }
.hero-sub { font-size: 9pt; color: #555; line-height: 1.5; }
.cred-card { background: #F8F9FB; border: 1pt solid #E8ECF0; border-top: 3pt solid #27AAE1; padding: 14pt 18pt; margin-bottom: 16pt; }
.cred-score { font-size: 24pt; font-weight: 800; color: ${credColor}; line-height: 1; }
.cred-bar { height: 6pt; background: #E8ECF0; border-radius: 3pt; overflow: hidden; margin: 8pt 0; }
.cred-fill { height: 100%; background: linear-gradient(90deg,#C0392B 0%,#8A6500 50%,#2D9E5A 100%); }
.cred-reasons { font-size: 9pt; color: #555; line-height: 1.6; }
.cred-reasons li { list-style: none; padding-left: 12pt; position: relative; margin-bottom: 3pt; }
.cred-reasons li::before { content: '•'; position: absolute; left: 0; color: #939393; }
.kv { font-size: 9.5pt; color: #555; margin: 4pt 0; }
.kv strong { color: #1f1f1f; }
.paired { background: #fff; border: 1pt solid #E8ECF0; border-left: 3pt solid #27AAE1; padding: 12pt 16pt; margin-bottom: 16pt; }
.paired-grid { display: flex; gap: 18pt; margin-top: 8pt; }
.paired-cell { flex: 1; }
.paired-cell .lbl { font-size: 8pt; font-weight: 700; color: #939393; text-transform: uppercase; letter-spacing: .4pt; }
.paired-cell .val { font-size: 14pt; font-weight: 800; margin-top: 3pt; line-height: 1; }
.paired-cell .sub { font-size: 8.5pt; color: #939393; margin-top: 3pt; }
.foot-note { font-size: 8pt; color: #939393; margin-top: 6pt; font-style: italic; }
table.data { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 8pt 0; }
table.data thead td { background: #27AAE1; color: #fff; font-weight: 700; padding: 7pt 8pt; font-size: 8pt; text-transform: uppercase; letter-spacing: .4pt; }
.section-intro { font-size: 9.5pt; color: #555; line-height: 1.6; margin-bottom: 10pt; font-style: italic; }
.interp-list { padding: 0; margin: 0; }
@media print { .no-print { display: none; } }
.no-print { position: fixed; top: 12pt; right: 12pt; background: #27AAE1; color: #fff; padding: 8pt 14pt; border: 0; border-radius: 6pt; font-family: inherit; font-size: 10pt; font-weight: 700; cursor: pointer; box-shadow: 0 4pt 14pt rgba(39,170,225,.25); z-index: 9999; }
</style>
</head>
<body>
<button class="no-print" onclick="window.print()">🖨 Print / Save as PDF</button>
<table id="pw">
  <thead><tr><td><img class="hf" src="${CBL_HDR_JPEG}" alt="Cobblestone Learning"></td></tr></thead>
  <tfoot><tr><td><img class="hf" src="${CBL_FTRD_JPEG}" alt=""></td></tr></tfoot>
  <tbody><tr><td>

    <h1>SiteGround CPU Analysis</h1>
    <div class="cover-meta">
      <strong>Site:</strong> ${esc(target)}<br>
      <strong>Fix / Event date:</strong> ${esc(fixDate)}<br>
      <strong>Before window:</strong> ${esc(cmp.bStart)} → ${esc(cmp.bEnd)} (${cmp.bDates.length} days)<br>
      <strong>After window:</strong> ${esc(cmp.aStart)} → ${esc(cmp.aEnd)} (${cmp.aDates.length} days)<br>
      <strong>Control group:</strong> ${esc(ctrlDoms.join(', ') || 'none')}<br>
      <strong>Generated:</strong> ${esc(stamp)}
      ${planLine}
    </div>

    <h2>Headline result</h2>
    <p class="section-intro">The "Net Effect" subtracts ${baseWord}'s drift from the target's drift, isolating the impact attributable to the fix.${baseIsNet ? '' : ' The comparison baseline here is your selected peer group; the whole-network figure is shown as context below.'}</p>
    <div class="hero">
      <div class="hero-row">
        <div class="hero-cell">
          <div class="hero-lbl">Net Effect vs ${baseIsNet ? 'network' : 'selected peers'}</div>
          <div class="hero-big" style="color:${heroColor}">${heroLabel}</div>
          <div class="hero-sub">${esc(verdict)}</div>
        </div>
        <div class="hero-cell">
          <div class="hero-lbl">Target change</div>
          <div class="hero-big" style="color:${cmp.targetPctCh === null ? '#939393' : cmp.targetPctCh < 0 ? '#2D9E5A' : '#C0392B'};font-size:16pt;">${signStr(cmp.targetPctCh)}</div>
          <div class="hero-sub">${fmtN(cmp.tAvgB)} → ${fmtN(cmp.tAvgA)} CPU sec/day</div>
        </div>
        <div class="hero-cell">
          <div class="hero-lbl">${baseTitle} change <span style="color:#939393;font-weight:400">(${cmp.ctrlDoms.length} site${cmp.ctrlDoms.length === 1 ? '' : 's'})</span></div>
          <div class="hero-big" style="color:${cmp.baselinePctCh === null ? '#939393' : cmp.baselinePctCh < 0 ? '#2D9E5A' : '#C0392B'};font-size:16pt;">${signStr(cmp.baselinePctCh)}</div>
          <div class="hero-sub">${fmtN(cmp.cAvgB)} → ${fmtN(cmp.cAvgA)} CPU sec/day</div>
        </div>
      </div>
      ${baseIsNet ? '' : `<div style="margin-top:10pt;font-size:8.5pt;color:#939393;">Whole-network context (${cmp.networkDoms.length} sites): ${fmtN(cmp.nAvgB)} → ${fmtN(cmp.nAvgA)} CPU sec/day (${signStr(cmp.networkPctCh)}); net effect vs network ${cmp.netEffectPctVsNetwork === null ? '—' : (cmp.netEffectPctVsNetwork > 0 ? '+' : '') + cmp.netEffectPctVsNetwork.toFixed(1) + ' pp'}.</div>`}
      ${(cmp.savedCpuPerDay !== null && cmp.expectedAfter !== null) ? `<div style="margin-top:14pt;padding-top:12pt;border-top:1pt dashed #E8ECF0;font-size:9.5pt;color:#3D3D3D;line-height:1.6;">
        <strong>Counterfactual:</strong> had the target drifted with ${baseWord}, after-CPU would sit at ~<strong>${fmtN(cmp.expectedAfter)}</strong> CPU sec/day; actual is <strong>${fmtN(cmp.tAvgA)}</strong> — a net <strong style="color:${cmp.savedCpuPerDay >= 0 ? '#2D9E5A' : '#C0392B'}">${cmp.savedCpuPerDay >= 0 ? 'saving' : 'loss'} of ${fmtN(Math.abs(cmp.savedCpuPerDay))}</strong> CPU sec/day vs that counterfactual.
        ${cmp.targetRank > 0 ? `<br>Target rank: <strong>#${cmp.targetRank} of ${cmp.perSite.length}</strong> active sites${cmp.targetPercentile !== null ? ` — improved more than <strong>${cmp.targetPercentile.toFixed(0)}%</strong> of peers.` : '.'}` : ''}
      </div>` : ''}
    </div>

    ${cmp.credibility ? `
    <h2>Credibility of this analysis</h2>
    <p class="section-intro">A composite score of how trustworthy the figures above are, given window length, weekday coverage, plan-change context, and statistical significance.</p>
    <div class="cred-card">
      <div style="display:flex;gap:24pt;align-items:flex-start;">
        <div style="flex:0 0 110pt;">
          <div class="hero-lbl">Credibility</div>
          <div class="cred-score">${cmp.credibility.score}/100</div>
          <div class="cred-bar"><div class="cred-fill" style="width:${cmp.credibility.score}%"></div></div>
          <div style="font-size:10pt;font-weight:700;color:${credColor}">${esc(cmp.credibility.verdict)}</div>
        </div>
        <div style="flex:1;">
          <ul class="cred-reasons">
            ${cmp.credibility.reasons.length ? cmp.credibility.reasons.map(r => `<li>${esc(r)}</li>`).join('') : '<li>All quality checks passed — window length sufficient, weekdays well matched, statistically significant.</li>'}
          </ul>
        </div>
      </div>
    </div>
    ` : ''}

    ${(cmp.tBPaired.length >= 2 && cmp.netEffectPctPaired !== null) ? `
    <h2>Weekday-paired analysis</h2>
    <p class="section-intro">Same calculation as above but limited to days matched weekday-for-weekday between before and after — removes calendar-mix bias from short windows.</p>
    <div class="paired">
      <div class="kv"><strong>${cmp.tBPaired.length} matched pairs</strong> covering weekdays: ${cmp.dowsCovered.map(d => dows[d]).join(', ') || '—'}</div>
      <div class="paired-grid">
        <div class="paired-cell">
          <div class="lbl">Net effect (paired)</div>
          <div class="val" style="color:${cmp.netEffectPctPaired === null ? '#939393' : cmp.netEffectPctPaired <= -10 ? '#2D9E5A' : cmp.netEffectPctPaired >= 10 ? '#C0392B' : '#0074B4'}">${signStr(cmp.netEffectPctPaired)} pp</div>
        </div>
        <div class="paired-cell">
          <div class="lbl">Target (paired)</div>
          <div class="val" style="color:${cmp.targetPctChPaired === null ? '#939393' : cmp.targetPctChPaired < 0 ? '#2D9E5A' : '#C0392B'}">${signStr(cmp.targetPctChPaired)}</div>
          <div class="sub">${fmtN(cmp.tBPAvg)} → ${fmtN(cmp.tAPAvg)} CPU sec/day</div>
        </div>
        <div class="paired-cell">
          <div class="lbl">${baseTitle} (paired)</div>
          <div class="val" style="color:${cmp.baselinePctChPaired === null ? '#939393' : cmp.baselinePctChPaired < 0 ? '#2D9E5A' : '#C0392B'}">${signStr(cmp.baselinePctChPaired)}</div>
          <div class="sub">${fmtN(cmp.cBPAvg)} → ${fmtN(cmp.cAPAvg)} CPU sec/day</div>
        </div>
      </div>
      ${cmp.statResid ? `<div class="foot-note">DiD residual t-test: p=${cmp.statResid.p < 0.001 ? '<0.001' : cmp.statResid.p.toFixed(3)}, df=${cmp.statResid.df.toFixed(1)} ${cmp.statResid.p < 0.05 ? '— statistically significant isolated effect.' : '— not statistically significant.'}</div>` : ''}
    </div>
    ` : ''}

    <h2>Detailed metrics</h2>
    <p class="section-intro">Every comparison metric the dashboard tracks for this target site.</p>
    <table class="data">
      <thead><tr>
        <td style="width:42%;text-align:left">Metric</td>
        <td style="width:24%;text-align:right">Before</td>
        <td style="width:24%;text-align:right">After</td>
        <td style="width:10%;text-align:right">Δ%</td>
      </tr></thead>
      <tbody>${metricsRows}</tbody>
    </table>

    <h2>All-sites ranking — top 14 by improvement</h2>
    <p class="section-intro">Every other active site sorted by before→after percent change. Helps spot whether the target was uniquely improved or moved with a network-wide trend.</p>
    <table class="data">
      <thead><tr>
        <td style="width:6%;text-align:right">#</td>
        <td style="width:46%;text-align:left">Site</td>
        <td style="width:12%;text-align:left">Activity</td>
        <td style="width:12%;text-align:right">Before</td>
        <td style="width:12%;text-align:right">After</td>
        <td style="width:12%;text-align:right">Δ%</td>
      </tr></thead>
      <tbody>${rankRows}</tbody>
    </table>

    <h2>Interpretation</h2>
    <p class="section-intro">Plain-English read of the figures above — the bullets the dashboard generates for the "Data Interpretation" panel.</p>
    <ul class="interp-list">${interpItems}</ul>

    <div style="margin-top:24pt;padding-top:12pt;border-top:1pt solid #E8ECF0;font-size:8pt;color:#939393;line-height:1.5;">
      <strong style="color:#3D3D3D">Cobblestone Learning</strong> · 5 Lombard Street, Dublin 2, Ireland · +353 1 908 1582 · info@cobblestonelearning.com<br>
      Generated by the SiteGround Reports dashboard. Raw data from SiteGround's uapi.siteground.com stats endpoints. All metrics on this report (CPU seconds, executions, cores in use, GB used) are absolute measurements — plan-immune by construction, comparable across any plan change in the analysis window.
    </div>

  </td></tr></tbody>
</table>
<script>
window.addEventListener('load', function() {
  try {
    var A4px = Math.round(297 / 25.4 * 96);
    var pw = document.getElementById('pw');
    var rem = pw.offsetHeight % A4px;
    if (rem > 40) {
      var sp = document.createElement('tr');
      sp.innerHTML = '<td style="height:' + (A4px - rem) + 'px"></td>';
      pw.querySelector('tbody').appendChild(sp);
    }
  } catch (e) {}
  setTimeout(function() { window.print(); }, 900);
});
</script>
</body>
</html>`;
        const w = window.open('', '_blank');
        if (!w) {
            alert('Pop-up blocked. Allow pop-ups for SiteGround Site Tools to generate the report.');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }
    ;

    // ── TRENDS TAB ────────────────────────────────────────────────────────────
    // ── Learner-Activity view (executions-as-learner-presence) ──────────────────
    // Scope follows the group selector so the activity view is reactive to it.
    const activityScopeDoms = gs => (S.ui.group === 'all' || S.ui.group === 'active') ? null : gs.map(s => s.domain);
    // Shared by the card header and its chart so both report identical numbers.
    const buildActivityView = (data, gs) => {
        if (!data.hasExec)
            return null;
        const act = buildActivityMatrix(activityScopeDoms(gs));
        if (!act || !act.peakHour)
            return null;
        const coreM = buildCoreHourMatrix();
        const ph = act.peakHour.h;
        let coresAtPeak = null;
        if (coreM) {
            const col = coreM.avg.map(r => r[ph]).filter(v => v !== null);
            if (col.length)
                coresAtPeak = col.reduce((s, v) => s + v, 0) / col.length;
        }
        const headroom = (coresAtPeak !== null && coreM?.limit) ? (1 - coresAtPeak / coreM.limit) * 100 : null;
        const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hLbl = h => String(h).padStart(2, '0') + ':00';
        const isHeat = act.weekdaysCovered >= 4 && !!act.peak;
        const busyWindow = isHeat ? `${DOW[act.peak.w]} ${hLbl(act.peak.h)}` : hLbl(ph);
        return { act, coreM, headroom, busyWindow, isHeat, limit: coreM?.limit };
    }
    ;
    const activityCardHTML = (data, gs) => {
        if (!data.hasExec)
            return `<div class="sbar info">🎓 Learner-activity rhythm needs hourly executions — open SiteGround <strong>Program Executions → Last 24 Hours</strong> and it appears here.</div>`;
        const v = buildActivityView(data, gs);
        if (!v)
            return '';
        const hr = v.headroom;
        const hrCls = hr === null ? 'cd' : hr < 15 ? 'cr' : hr < 35 ? 'cw2' : 'cg';
        const scopeLbl = (S.ui.group === 'all' || S.ui.group === 'active') ? 'all sites' : (GROUP_DEFS[S.ui.group] || S.ui.group);
        return `<div class="cw"><div class="cw-t">🎓 Learner Activity — when is the platform actually being used?<span class="cw-hint">Hourly program executions are the closest infra proxy for “how many learners are on the platform”. ${v.isHeat ? 'Each heatmap cell is the average for that weekday + hour.' : 'Hour-of-day profile from the ~24–48h of hourly data SiteGround exposes per capture; the weekday heatmap fills in as the hourly rollup accumulates across visits.'} Scope: ${esc(scopeLbl)}.</span></div>
      <div style="padding:9px 14px;margin:0 0 8px;font-size:13px;line-height:1.5;color:var(--text);background:var(--accent-bg);border-left:3px solid var(--accent);border-radius:6px">Busiest learning window: <strong>${v.busyWindow}</strong> · ~<strong>${fmtN(v.act.peakHour.v)}</strong> requests/hr${hr !== null ? ` · headroom there: <strong class="${hrCls}">${hr.toFixed(0)}%</strong> of the ${v.limit}-core plan` : ''}</div>
      <div class="ch" id="ch-activity" style="height:${v.isHeat ? '300' : '230'}px"></div></div>`;
    }
    ;
    const renderTrends = data => {
        const body = document.getElementById('sgd-body');
        const hasH = !!(CAP.sec_hourly && CAP.core_hourly)
          , has3 = !!CAP.core_3min;
        const gs = groupSites(data, S.ui.group);
        const acctVals = [...data.acctMap.values()].filter(v => v > 0);
        let inner = '';
        if (S.ui.viewStep === 'daily') {
            const actCard = activityCardHTML(data, gs);
            inner = `
      ${data.planChanges?.length ? `<div class="sbar info" style="background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)" ${tipAttr('plan_change')}>ℹ️ Plan upgraded during this period: ${data.planChanges.map(c => `<strong>${c.kind} ${c.fromVal}→${c.toVal}${c.kind === 'mem' ? 'GB' : ' cores'}</strong> on ${c.date}`).join('; ')}. Every metric on this dashboard is in absolute units (cores in use, GB used, CPU seconds) — plan-immune by construction, so the timeline is directly comparable. ${tipIcon('plan_change')}</div>` : ''}
      ${actCard}
      <div class="cw"><div class="cw-t">CPU Seconds — Daily ${tipIcon('cpu_seconds')}</div><div class="ch tall" id="ch-td1"></div></div>
      ${data.hasExec ? `<div class="cw"><div class="cw-t">Program Executions — Daily ${tipIcon('program_executions')}</div><div class="ch" id="ch-td2"></div></div>` : ''}
      <div class="cw"><div class="cw-t">Cores in Use + Account CPU + Trajectory — Daily ${tipIcon('core_pct')}${data.hasCorePeak ? ` <span style="font-size:10px;color:var(--text-faint);font-weight:600;margin-left:8px">solid line = day average · dashed amber = day PEAK (from hourly) ${tipIcon('core_peak')}</span>` : ''}<span style="font-size:10px;color:#334155;margin-left:8px">trajectory line projects the last 7 complete days forward 7 days</span></div><div class="ch" id="ch-td3"></div></div>
      ${data.hasMem ? `<div class="cw"><div class="cw-t">Memory (GB) — Real + Cache + Combined ${tipIcon('mem_combined')}<span style="font-size:10px;color:var(--text-faint);font-weight:600;margin-left:8px">${data.memDailyComplete ? `${data.benchmarks.mem ? `combined avg over period: ${(data.benchmarks.mem.avg30).toFixed(2)} GB` : ''}` : `⚠️ only ${(data.memDailyCoverage * 100).toFixed(0)}% of days captured — open SG <strong>Memory → Last Month</strong> to fill in`}</span></div><div class="ch" id="ch-tdmem"></div></div>` : `<div class="sbar warn">Memory Daily not captured yet — open SiteGround <strong>Memory Usage → Last Month</strong> to enable this panel.</div>`}
      <div class="cw"><div class="cw-t">📅 Day-of-Week Pattern<span class="cw-hint">Average + peak account-wide CPU broken out by weekday over the captured period. Bars where the peak (red outline) is much taller than the average (solid blue) mean that weekday is unstable — typically scheduled jobs, weekly traffic events, or batch processing.</span></div><div class="ch" id="ch-tddow" style="height:240px"></div></div>
      <div class="baro-row">
        <div class="baro-card"><div class="baro-t">📊 Daily CPU Distribution<span style="font-size:10px;color:var(--text-faint);font-weight:400;margin-left:6px">how often does each volume occur</span></div><div class="ch" id="ch-tdhist" style="height:200px"></div></div>
        <div class="baro-card"><div class="baro-t">🔁 Site Correlation — daily CPU pairs<span style="font-size:10px;color:var(--text-faint);font-weight:400;margin-left:6px">do these sites move together?</span></div><div class="ch" id="ch-tdcorr" style="height:200px"></div></div>
      </div>
      <div class="bench-strip">
        <div class="bench-item"><div class="bench-lbl">Cores in Use <span style="color:var(--text-faint);font-size:9px">of ${data.currentCoreLimit}</span></div>
          <div class="bench-row"><span class="bench-key">Now (7d avg)</span><span class="bench-val now">${fmtD(data.benchmarks.core.avg7, 2)}</span></div>
          <div class="bench-row"><span class="bench-key">30-day avg</span><span class="bench-val">${fmtD(data.benchmarks.core.avg30, 2)}</span></div>
          <div class="bench-row"><span class="bench-key">All-time peak</span><span class="bench-val gcrit" style="color:var(--crit)">${fmtD(data.benchmarks.core.max, 2)}</span></div>
          <div class="bench-row"><span class="bench-key">All-time low</span><span class="bench-val" style="color:var(--ok)">${fmtD(data.benchmarks.core.min, 2)}</span></div>
          <div class="bench-row" style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border-faint)"><span class="bench-key" style="font-size:9px;line-height:1.4;color:var(--text-faint)">Cores are plan-immune — same number regardless of 7- or 9-core plan</span></div>
        </div>
        <div class="bench-item"><div class="bench-lbl">Account CPU / Day</div>
          <div class="bench-row"><span class="bench-key">7d avg</span><span class="bench-val now">${fmtN(data.benchmarks.acct.avg7)}</span></div>
          <div class="bench-row"><span class="bench-key">30d avg</span><span class="bench-val">${fmtN(data.benchmarks.acct.avg30)}</span></div>
          <div class="bench-row"><span class="bench-key">Peak day</span><span class="bench-val" style="color:#ef4444">${fmtN(data.benchmarks.acct.max)}</span></div>
        </div>
        ${data.benchmarks.mem ? `<div class="bench-item"><div class="bench-lbl">Memory (GB) <span style="color:var(--text-faint);font-size:9px">of ${data.currentMemLimitGb ?? '?'} GB</span></div>
          <div class="bench-row"><span class="bench-key">7d avg</span><span class="bench-val now">${fmtD(data.benchmarks.mem.avg7, 2)}</span></div>
          <div class="bench-row"><span class="bench-key">30d avg</span><span class="bench-val">${fmtD(data.benchmarks.mem.avg30, 2)}</span></div>
          <div class="bench-row"><span class="bench-key">Peak</span><span class="bench-val" style="color:#ef4444">${fmtD(data.benchmarks.mem.max, 2)}</span></div>
        </div>` : ''}
        ${data.coreProj?.reg ? `<div class="bench-item"><div class="bench-lbl">Trajectory (7d→)</div>
          <div class="bench-row"><span class="bench-key">Slope</span><span class="bench-val now ${data.coreProj.reg.slope > 0.05 ? 'cr' : data.coreProj.reg.slope > 0 ? 'cw2' : 'cg'}">${data.coreProj.reg.slope > 0 ? '+' : ''}${data.coreProj.reg.slope.toFixed(3)} cores/d</span></div>
          <div class="bench-row"><span class="bench-key">→ ${(data.currentCoreLimit * 0.75).toFixed(2)} cores (75%)</span><span class="bench-val ${data.coreProj.daysTo75 && data.coreProj.daysTo75 < 7 ? 'cr' : 'cn'}">${data.coreProj.daysTo75 ? data.coreProj.daysTo75.toFixed(1) + 'd' : '—'}</span></div>
          ${data.coreProj.ci && (data.coreProj.ci.daysLo || data.coreProj.ci.daysHi) ? `<div class="bench-row"><span class="bench-key" style="font-size:9.5px">95% CI</span><span class="bench-val" style="font-size:10.5px;color:var(--text-faint)">${data.coreProj.ci.daysLo ? data.coreProj.ci.daysLo.toFixed(0) + '–' : '<'}${data.coreProj.ci.daysHi ? data.coreProj.ci.daysHi.toFixed(0) + 'd' : '∞'}</span></div>` : ''}
          <div class="bench-row"><span class="bench-key">→ ${(data.currentCoreLimit * 0.9).toFixed(2)} cores (90%)</span><span class="bench-val ${data.coreProj.daysTo90 && data.coreProj.daysTo90 < 14 ? 'cr' : 'cn'}">${data.coreProj.daysTo90 ? data.coreProj.daysTo90.toFixed(1) + 'd' : '—'}</span></div>
          <div class="bench-row"><span class="bench-key">Fit r²</span><span class="bench-val">${data.coreProj.reg.r2.toFixed(2)} (n=${data.coreProj.sampleN})</span></div>
        </div>` : ''}
        ${gs.slice(0, 4).map(s => `<div class="bench-item"><div class="bench-lbl" title="${esc(s.domain)}">${esc(s.domain.split('.')[0])}</div>
          <div class="bench-row"><span class="bench-key">7d avg</span><span class="bench-val now">${fmtN(s.avg7)}</span></div>
          <div class="bench-row"><span class="bench-key">30d avg</span><span class="bench-val">${fmtN(s.avg)}</span></div>
          <div class="bench-row"><span class="bench-key">Peak</span><span class="bench-val" style="color:#ef4444">${fmtN(s.peak)}</span></div>
          <div class="bench-row"><span class="bench-key">7d trend</span><span class="bench-val ${clsCh(s.trend7)}">${signStr(s.trend7)}</span></div>
        </div>`).join('')}
      </div>`;
        } else if (S.ui.viewStep === 'hourly' && hasH) {
            inner = `<div class="cw"><div class="cw-t">🔥 Site × Hour Heatmap<span class="cw-hint">Each cell is one site at one hour. Darker / redder = more CPU. Lets you spot patterns at a glance: which site is active when, and where the hot hours are.</span></div><div class="ch" id="ch-hheatmap" style="height:320px"></div></div>
      <div class="cw"><div class="cw-t">CPU per Site — Last 24hr (hourly) ${tipIcon('cpu_seconds')}<span class="cw-hint">Line per site. Steeper rises = bursts; flat shoulders = sustained load.</span></div><div class="ch xl" id="ch-h1"></div></div>
      <div class="cw"><div class="cw-t">Cores in Use — Last 24hr (6-min) ${tipIcon('core_pct')}<span class="cw-hint">When this crosses the dashed red 75%-of-plan line, users are likely seeing slowdowns.</span></div><div class="ch" id="ch-h2"></div></div>
      ${CAP.mem_hourly ? `<div class="cw"><div class="cw-t">Memory (GB) — Last 24hr<span class="cw-hint">OOM-kill risk surfaces here before CPU symptoms.</span></div><div class="ch" id="ch-hmem"></div></div>` : ''}`;
        } else if (S.ui.viewStep === '3min' && has3) {
            inner = `<div class="cw"><div class="cw-t">Cores in Use — Last 30 Min at 15-sec resolution ${tipIcon('barometer')}</div><div class="ch xl" id="ch-3m"></div></div>
      ${CAP.mem_3min ? `<div class="cw"><div class="cw-t">Memory (GB) — Last 30 Min at 15-sec resolution</div><div class="ch xl" id="ch-3m-mem"></div></div>` : ''}`;
        } else {
            inner = `<div class="sbar warn">Switch SiteGround's chart to <strong>${S.ui.viewStep === 'hourly' ? '"Last 24 Hours"' : '"Last 30 Minutes"'}</strong> to capture this granularity. The badge in the header turns green once captured.</div>`;
        }
        body.innerHTML = `${introCard('trends')}<div class="ctrl-row">${groupCtrl()}${stepToggle()}</div>${inner}`;
        setTimeout( () => {
            if (S.ui.viewStep === 'daily')
                initTrendDaily(data, gs);
            else if (S.ui.viewStep === 'hourly' && hasH)
                initTrendHourly(data, gs);
            else if (S.ui.viewStep === '3min' && has3)
                initTrend3min();
        }
        , 0);
    }
    ;

    const initTrendDaily = (data, gs) => {
        // Learner-activity chart: 7×24 heatmap once enough weekdays have accumulated, else the
        // hour-of-day profile (requests/hr bars + capacity-% overlay) from the live ~24–48h capture.
        const actEl = document.getElementById('ch-activity');
        if (actEl) {
            const v = buildActivityView(data, gs);
            const cc = themeChartColors();
            const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const hrs = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
            if (v && v.isHeat) {
                const cells = [];
                let hmax = 0;
                for (let w = 0; w < 7; w++)
                    for (let hh = 0; hh < 24; hh++) {
                        const val = v.act.avg[w][hh];
                        if (val === null) continue;
                        cells.push([hh, w, Math.round(val)]);
                        if (val > hmax) hmax = val;
                    }
                cinit('ch-activity', {
                    backgroundColor: 'transparent',
                    tooltip: { ...BASE.tooltip, position: 'top', formatter: p => `${DOW[p.value[1]]} ${hrs[p.value[0]]}:00<br><strong>${fmtN(p.value[2])}</strong> requests/hr` },
                    grid: { left: 46, right: 18, top: 12, bottom: 48 },
                    xAxis: { type: 'category', data: hrs, splitArea: { show: true }, axisLabel: { color: cc.text, fontSize: 9, interval: 1 }, axisLine: { lineStyle: { color: cc.axis } }, axisTick: { show: false } },
                    yAxis: { type: 'category', data: DOW, splitArea: { show: true }, axisLabel: { color: cc.text, fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
                    visualMap: { min: 0, max: hmax || 1, calculable: false, orient: 'horizontal', left: 'center', bottom: 4, textStyle: { color: cc.text }, inRange: { color: ['#0a1628', '#1e3a8a', '#27AAE1', '#FFC20E', '#ef4444'] } },
                    series: [{ type: 'heatmap', data: cells, emphasis: { itemStyle: { borderColor: '#fff', borderWidth: 1 } } }]
                });
            } else if (v) {
                const vals = v.act.hourProfile.map(x => x === null ? null : Math.round(x));
                let loadPct = null;
                if (v.coreM && v.limit) {
                    loadPct = hrs.map((_, hh) => {
                        const col = v.coreM.avg.map(r => r[hh]).filter(x => x !== null);
                        return col.length ? +(col.reduce((s, x) => s + x, 0) / col.length / v.limit * 100).toFixed(1) : null;
                    });
                }
                const peakIdx = v.act.peakHour.h;
                cinit('ch-activity', {
                    ...BASE,
                    legend: { ...BASE.legend, bottom: 2, data: loadPct ? ['Requests/hr', 'Capacity %'] : ['Requests/hr'] },
                    grid: { left: 60, right: loadPct ? 52 : 24, top: 14, bottom: 40 },
                    tooltip: { ...BASE.tooltip, formatter: p => {
                        const i = p[0].dataIndex;
                        let s = `${hrs[i]}:00<br>Requests/hr: <strong>${vals[i] == null ? '—' : fmtN(vals[i])}</strong>`;
                        if (loadPct && loadPct[i] != null) s += `<br>Capacity used: <strong>${loadPct[i]}%</strong>`;
                        return s;
                    } },
                    xAxis: { ...BASE.xAxis, data: hrs, axisLabel: { ...BASE.xAxis.axisLabel, rotate: 0, interval: 1 } },
                    yAxis: [mkY('requests/hr', { axisLabel: { ...BASE.yAxis.axisLabel, formatter: x => fmtN(x) } }), { type: 'value', name: 'capacity %', max: 100, position: 'right', splitLine: { show: false }, nameTextStyle: { color: cc.text, fontSize: 9.5 }, axisLabel: { color: cc.text, fontSize: 10, formatter: x => x + '%' }, axisLine: { lineStyle: { color: cc.axis } } }],
                    series: [
                        { name: 'Requests/hr', type: 'bar', data: vals.map((x, i) => ({ value: x, itemStyle: { color: i === peakIdx ? '#FFC20E' : '#27AAE1' } })), barCategoryGap: '30%' },
                        ...(loadPct ? [{ name: 'Capacity %', type: 'line', yAxisIndex: 1, data: loadPct, smooth: true, symbol: 'none', lineStyle: { color: '#ef4444', width: 1.5, type: 'dashed' } }] : [])
                    ]
                });
            }
        }
        const ml = Math.max(...[...data.limitMap.values()], 9);
        // Extend x-axis 7 days forward so the trajectory line shows projection, not just fit.
        const projDates = [];
        if (data.coreProj?.reg) {
            for (let i = 1; i <= 7; i++)
                projDates.push(addDays(data.dates[data.dates.length - 1], i));
        }
        const xAxisDates = [...data.dates, ...projDates];
        cinit('ch-td1', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: gs.map(s => s.domain)
            },
            grid: {
                ...BASE.grid,
                bottom: 76
            },
            xAxis: {
                ...BASE.xAxis,
                data: data.dates
            },
            yAxis: mkY('CPU Seconds', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }),
            series: gs.map( (s, i) => ({
                ...mkLn(s.domain, data.dates.map(d => Math.round(data.sv(s.domain, d))), CFG.palette[i % CFG.palette.length], {
                    markLine: benchMark(s.dailyVals, CFG.palette[i % CFG.palette.length])
                })
            })),
            dataZoom: [...BASE.dataZoom]
        });
        if (data.hasExec)
            cinit('ch-td2', {
                ...BASE,
                legend: {
                    ...BASE.legend,
                    bottom: 28,
                    data: gs.map(s => s.domain)
                },
                grid: {
                    ...BASE.grid,
                    bottom: 76
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: data.dates
                },
                yAxis: mkY('Executions', {
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => fmtN(v)
                    }
                }),
                series: gs.map( (s, i) => mkBar(s.domain, data.dates.map(d => Math.round(data.ev(s.domain, d))), CFG.palette[i % CFG.palette.length])),
                dataZoom: [...BASE.dataZoom]
            });
        // Account CPU bars only span actual dates; pad with nulls for projection window
        const acctVals = data.dates.map(d => Math.round(data.acctMap.get(d) || 0)).concat(projDates.map( () => null));
        // Cores in use per day — plan-immune by construction, so no normalisation needed.
        const coreSeries = data.dates.map(d => +(data.coresUsedMap.get(d) || 0).toFixed(3)).concat(projDates.map( () => null));
        const corePeakSeries = data.hasCorePeak ? data.dates.map(d => {
            const v = data.coresPeakUsedMap.get(d);
            return v !== undefined ? +v.toFixed(3) : null;
        }
        ).concat(projDates.map( () => null)) : null;
        cinit('ch-td3', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: ['Cores (avg)', ...(corePeakSeries ? ['Cores (peak)'] : []), 'Account CPU', ...(data.coreProj?.reg ? ['Projected Cores'] : [])]
            },
            grid: {
                ...BASE.grid,
                bottom: 76,
                right: 78
            },
            xAxis: {
                ...BASE.xAxis,
                data: xAxisDates
            },
            yAxis: [mkY('Cores in Use', {
                min: 0,
                max: ml,
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => (+v).toFixed(1)
                }
            }), mkY('CPU Seconds', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            })],
            series: [{
                ...mkLn('Cores (avg)', coreSeries, '#94a3b8', {
                    symbol: 'circle',
                    symbolSize: 3,
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        data: [{
                            yAxis: +(ml * 0.75).toFixed(2),
                            lineStyle: {
                                color: '#ef4444',
                                type: 'dashed',
                                width: 1.5
                            },
                            label: {
                                formatter: `${(ml * 0.75).toFixed(2)} cores (75% of plan)`,
                                fontSize: 9,
                                color: '#ef4444'
                            }
                        }, ...((data.planChanges || []).map(c => ({
                            xAxis: c.date,
                            lineStyle: {
                                color: '#a78bfa',
                                type: 'dashed',
                                width: 1.5
                            },
                            label: {
                                formatter: `Plan ${c.kind === 'core' ? c.fromVal + '→' + c.toVal + 'c' : c.fromVal + '→' + c.toVal + 'GB'}`,
                                fontSize: 9,
                                color: '#a78bfa'
                            }
                        })))]
                    },
                    markArea: {
                        silent: true,
                        data: data.dates.filter(d => (data.coresUsedMap.get(d) || 0) > ml * 0.75).map(d => ([{
                            xAxis: d
                        }, {
                            xAxis: d
                        }])),
                        itemStyle: {
                            color: 'rgba(239,68,68,0.04)'
                        }
                    },
                })
            }, ...(corePeakSeries ? [{
                ...mkLn('Cores (peak)', corePeakSeries, '#FFC20E', {
                    symbol: 'circle',
                    symbolSize: 3,
                    lineStyle: {
                        color: '#FFC20E',
                        width: 1.5,
                        type: 'dashed'
                    },
                    z: 6
                })
            }] : []), ...(data.coreProj?.reg ? [{
                // Trajectory: project the regression line 7 days forward from the last complete day.
                // The line starts at the last actual y on the actual axis, then extends across the 7 synthetic projDates.
                name: 'Projected Cores',
                type: 'line',
                data: (() => {
                    const arr = new Array(xAxisDates.length).fill(null);
                    const startActualX = data.coreProj.lastX;
                    // First point: the actual last complete day (anchors the line on the data)
                    arr[startActualX] = data.coreProj.lastY;
                    // Then 7 forward-projected points
                    for (let i = 1; i <= 7; i++) {
                        const x = startActualX + i;
                        if (x < arr.length)
                            arr[x] = +(data.coreProj.reg.slope * x + data.coreProj.reg.intercept).toFixed(3);
                    }
                    return arr;
                }
                )(),
                lineStyle: {
                    color: '#FFC20E',
                    type: 'dashed',
                    width: 1.5
                },
                itemStyle: {
                    color: '#FFC20E'
                },
                symbol: 'circle',
                symbolSize: 3,
                connectNulls: false,
                tooltip: {
                    show: true
                },
                z: 5
            }] : []), {
                name: 'Account CPU',
                type: 'bar',
                yAxisIndex: 1,
                data: acctVals,
                itemStyle: {
                    color: 'rgba(39,170,225,0.18)',
                    borderColor: 'rgba(39,170,225,0.35)',
                    borderWidth: 1
                },
                markLine: benchMark(acctVals, '#27AAE1')
            }, ],
            dataZoom: [...BASE.dataZoom]
        });
        // Memory daily series in GB (plan-immune). Real (process), Cache (filesystem reclaimable),
        // and Combined. Combined is the OOM-risk signal. Y-axis = GB; threshold lines at 75%/85% of plan.
        if (data.hasMem) {
            const memLimGb = data.currentMemLimitGb || 14;
            cinit('ch-tdmem', {
                ...BASE,
                legend: {
                    ...BASE.legend,
                    bottom: 4,
                    data: ['Real (process)', 'Cache (filesystem)', 'Combined']
                },
                grid: {
                    ...BASE.grid,
                    bottom: 56
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: data.dates
                },
                yAxis: mkY('Memory (GB)', {
                    min: 0,
                    max: memLimGb,
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => `${(+v).toFixed(1)}`
                    }
                }),
                series: [{
                    type: 'line',
                    name: 'Real (process)',
                    data: data.dates.map(d => {
                        const gb = data.memDailyGbMap.get(d);
                        return gb !== undefined ? +gb.toFixed(2) : null;
                    }
                    ),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 3,
                    lineStyle: {
                        color: '#a78bfa',
                        width: 2
                    },
                    itemStyle: {
                        color: '#a78bfa'
                    },
                    connectNulls: false,
                    z: 5
                }, {
                    type: 'line',
                    name: 'Cache (filesystem)',
                    data: data.dates.map(d => {
                        const gb = data.memDailyCacheMap.get(d);
                        return gb !== undefined ? +gb.toFixed(2) : null;
                    }
                    ),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 2,
                    lineStyle: {
                        color: '#64748b',
                        width: 1,
                        type: 'dotted'
                    },
                    itemStyle: {
                        color: '#64748b'
                    },
                    connectNulls: false
                }, {
                    type: 'line',
                    name: 'Combined',
                    data: data.dates.map(d => {
                        const gb = data.memCombinedGbMap.get(d);
                        return gb !== undefined ? +gb.toFixed(2) : null;
                    }
                    ),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 3,
                    lineStyle: {
                        color: '#ef4444',
                        width: 2
                    },
                    itemStyle: {
                        color: '#ef4444'
                    },
                    areaStyle: {
                        color: 'rgba(239,68,68,0.07)'
                    },
                    connectNulls: false,
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        data: [{
                            yAxis: +(memLimGb * 0.75).toFixed(2),
                            lineStyle: {
                                color: '#FFC20E',
                                type: 'dashed',
                                width: 1
                            },
                            label: {
                                formatter: `${(memLimGb * 0.75).toFixed(1)} GB (75% pressure)`,
                                fontSize: 9,
                                color: '#FFC20E'
                            }
                        }, {
                            yAxis: +(memLimGb * 0.85).toFixed(2),
                            lineStyle: {
                                color: '#ef4444',
                                type: 'dashed',
                                width: 1.5
                            },
                            label: {
                                formatter: `${(memLimGb * 0.85).toFixed(1)} GB (85% danger)`,
                                fontSize: 9,
                                color: '#ef4444'
                            }
                        }, ...((data.planChanges || []).filter(c => c.kind === 'mem').map(c => ({
                            xAxis: c.date,
                            lineStyle: {
                                color: '#a78bfa',
                                type: 'dashed',
                                width: 1.5
                            },
                            label: {
                                formatter: `Plan ${c.fromVal}→${c.toVal}GB`,
                                fontSize: 9,
                                color: '#a78bfa'
                            }
                        })))]
                    }
                }],
                dataZoom: [...BASE.dataZoom]
            });
        }
        // Day-of-week pattern: bar chart of avg + peak account CPU per weekday
        const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const byDow = dow.map( () => []);
        data.dates.forEach(d => {
            if (data.incompleteDates.has(d))
                return;
            const dt = new Date(`${d}T00:00:00Z`);
            const idx = dt.getUTCDay();
            const v = data.acctMap.get(d) || 0;
            if (v > 0)
                byDow[idx].push(v);
        }
        );
        const dowAvg = byDow.map(a => a.length ? avgAll(a) : 0);
        const dowPeak = byDow.map(a => a.length ? Math.max(...a) : 0);
        const dowN = byDow.map(a => a.length);
        cinit('ch-tddow', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 4,
                data: ['Average', 'Peak']
            },
            grid: {
                left: 64,
                right: 24,
                top: 18,
                bottom: 38
            },
            tooltip: {
                ...BASE.tooltip,
                formatter: p => {
                    const i = p[0].dataIndex;
                    return `${dow[i]} (n=${dowN[i]})<br>Avg: <strong>${fmtN(dowAvg[i])}</strong><br>Peak: <strong>${fmtN(dowPeak[i])}</strong>`;
                }
            },
            xAxis: {
                ...BASE.xAxis,
                data: dow,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    rotate: 0
                }
            },
            yAxis: mkY('CPU sec/day', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }),
            series: [{
                name: 'Average',
                type: 'bar',
                data: dowAvg.map(v => Math.round(v)),
                itemStyle: {
                    color: '#27AAE1'
                },
                barGap: '-100%',
                barCategoryGap: '40%'
            }, {
                name: 'Peak',
                type: 'bar',
                data: dowPeak.map(v => Math.round(v)),
                itemStyle: {
                    color: 'rgba(239,68,68,0.35)',
                    borderColor: '#f87171',
                    borderWidth: 1
                },
                barCategoryGap: '40%',
                z: -1
            }],
            dataZoom: []
        });
        // Histogram: distribution of daily account CPU values
        const acctSeries = data.dates.filter(d => !data.incompleteDates.has(d)).map(d => data.acctMap.get(d) || 0).filter(v => v > 0);
        if (acctSeries.length > 3) {
            const minV = Math.min(...acctSeries)
              , maxV = Math.max(...acctSeries);
            const binCount = Math.min(10, Math.max(5, Math.floor(Math.sqrt(acctSeries.length))));
            const binW = (maxV - minV) / binCount || 1;
            const bins = new Array(binCount).fill(0);
            const labels = [];
            for (let i = 0; i < binCount; i++)
                labels.push(`${fmtN(minV + i * binW)}-${fmtN(minV + (i + 1) * binW)}`);
            acctSeries.forEach(v => {
                let idx = Math.floor((v - minV) / binW);
                if (idx >= binCount)
                    idx = binCount - 1;
                bins[idx]++;
            }
            );
            cinit('ch-tdhist', {
                ...BASE,
                legend: {
                    show: false
                },
                grid: {
                    left: 56,
                    right: 16,
                    top: 12,
                    bottom: 50
                },
                tooltip: {
                    ...BASE.tooltip,
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: p => `<strong>${p[0].axisValue}</strong> CPU sec/day<br>${p[0].value} day${p[0].value === 1 ? '' : 's'}`
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: labels,
                    axisLabel: {
                        ...BASE.xAxis.axisLabel,
                        rotate: 30,
                        fontSize: 9.5
                    }
                },
                yAxis: mkY('Days', {
                    minInterval: 1,
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => Math.round(v)
                    }
                }),
                series: [{
                    type: 'bar',
                    data: bins,
                    itemStyle: {
                        color: '#27AAE1',
                        borderRadius: [3, 3, 0, 0]
                    }
                }],
                dataZoom: []
            });
        }
        // Correlation scatter: top 2 sites' daily CPU plotted against each other
        const topSites = data.siteStats.slice(0, 2);
        if (topSites.length === 2) {
            const a = topSites[0], b = topSites[1];
            const completeDates = data.dates.filter(d => !data.incompleteDates.has(d));
            const pairs = completeDates.map(d => [data.sv(a.domain, d), data.sv(b.domain, d)]).filter( ([x,y]) => x > 0 || y > 0);
            // Pearson correlation coefficient
            const n = pairs.length;
            if (n > 2) {
                const mx = pairs.reduce( (s, p) => s + p[0], 0) / n
                  , my = pairs.reduce( (s, p) => s + p[1], 0) / n;
                let num = 0, dx2 = 0, dy2 = 0;
                pairs.forEach( ([x,y]) => {
                    num += (x - mx) * (y - my);
                    dx2 += (x - mx) ** 2;
                    dy2 += (y - my) ** 2;
                }
                );
                const r = dx2 > 0 && dy2 > 0 ? num / Math.sqrt(dx2 * dy2) : 0;
                cinit('ch-tdcorr', {
                    ...BASE,
                    legend: {
                        show: false
                    },
                    grid: {
                        left: 60,
                        right: 24,
                        top: 30,
                        bottom: 50
                    },
                    title: {
                        text: `r = ${r.toFixed(2)} ${r > 0.7 ? '— strong positive (move together)' : r > 0.3 ? '— moderate positive' : r > -0.3 ? '— uncorrelated' : '— inverse'}`,
                        textStyle: {
                            color: themeChartColors().text,
                            fontSize: 10.5,
                            fontWeight: 'normal'
                        },
                        top: 4,
                        left: 'center'
                    },
                    tooltip: {
                        ...BASE.tooltip,
                        trigger: 'item',
                        formatter: p => `<strong>${esc(a.domain.split('.')[0])}:</strong> ${fmtN(p.value[0])}<br><strong>${esc(b.domain.split('.')[0])}:</strong> ${fmtN(p.value[1])}`
                    },
                    xAxis: {
                        ...BASE.xAxis,
                        type: 'value',
                        name: a.domain.split('.')[0],
                        nameLocation: 'middle',
                        nameGap: 28,
                        nameTextStyle: {
                            color: themeChartColors().text,
                            fontSize: 10
                        },
                        axisLabel: {
                            ...BASE.xAxis.axisLabel,
                            formatter: v => fmtN(v),
                            rotate: 0
                        }
                    },
                    yAxis: mkY(b.domain.split('.')[0], {
                        axisLabel: {
                            ...BASE.yAxis.axisLabel,
                            formatter: v => fmtN(v)
                        }
                    }),
                    series: [{
                        type: 'scatter',
                        data: pairs,
                        symbolSize: 7,
                        itemStyle: {
                            color: '#27AAE1',
                            opacity: 0.7,
                            borderColor: themeChartColors().tipBg,
                            borderWidth: 1
                        }
                    }],
                    dataZoom: []
                });
            }
        }
    }
    ;

    const initTrendHourly = (data, gs) => {
        const h = buildHourlyData();
        if (!h)
            return;
        // Site × Hour heatmap
        const topForHeat = h.sites
            .map(s => ({
                domain: s.domain,
                pts: s.points || [],
                total: (s.points || []).reduce( (t, p) => t + (+p.value || 0), 0)
            }))
            .sort( (a, b) => b.total - a.total)
            .slice(0, 10);
        const heatData = [];
        let heatMax = 0;
        topForHeat.forEach( (s, si) => {
            s.pts.forEach( (p, hi) => {
                const v = Math.round(+p.value || 0);
                if (v > 0)
                    heatMax = Math.max(heatMax, v);
                heatData.push([hi, si, v]);
            }
            );
        }
        );
        cinit('ch-hheatmap', {
            backgroundColor: 'transparent',
            tooltip: {
                ...BASE.tooltip,
                position: 'top',
                formatter: p => `<strong>${esc(topForHeat[p.value[1]]?.domain || '')}</strong><br>${esc(h.coreLabels[p.value[0]] || '')}: <strong>${fmtN(p.value[2])} CPU sec</strong>`
            },
            grid: {
                left: 220,
                right: 24,
                top: 16,
                bottom: 50
            },
            xAxis: {
                type: 'category',
                data: h.coreLabels,
                splitArea: {
                    show: true
                },
                axisLabel: {
                    color: themeChartColors().text,
                    fontSize: 9.5,
                    interval: Math.floor(h.coreLabels.length / 8),
                    rotate: 0
                },
                axisLine: {
                    lineStyle: {
                        color: themeChartColors().axis
                    }
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'category',
                data: topForHeat.map(s => s.domain),
                splitArea: {
                    show: true
                },
                axisLabel: {
                    color: themeChartColors().text,
                    fontSize: 10.5
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            visualMap: {
                min: 0,
                max: heatMax || 100,
                calculable: false,
                orient: 'horizontal',
                left: 'center',
                bottom: 4,
                inRange: {
                    color: ['#0a1628', '#1e3a8a', '#27AAE1', '#FFC20E', '#ef4444']
                },
                textStyle: {
                    color: themeChartColors().text,
                    fontSize: 9.5
                },
                itemHeight: 80,
                itemWidth: 10
            },
            series: [{
                type: 'heatmap',
                data: heatData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 8,
                        shadowColor: 'rgba(0,0,0,0.4)'
                    }
                },
                progressive: 200
            }]
        });
        cinit('ch-h1', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: gs.map(s => s.domain)
            },
            grid: {
                ...BASE.grid,
                bottom: 76
            },
            xAxis: {
                ...BASE.xAxis,
                data: h.secLabels,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    interval: Math.floor(h.secLabels.length / 8)
                }
            },
            yAxis: mkY('CPU sec/hr', {
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => fmtN(v)
                }
            }),
            series: gs.map( (s, i) => {
                const sp = h.sites.find(x => x.domain === s.domain);
                return {
                    ...mkLn(s.domain, h.secLabels.map( (_, li) => Math.round(sp?.points?.[li]?.value || 0)), CFG.palette[i % CFG.palette.length], {
                        smooth: true,
                        symbol: 'none'
                    })
                };
            }
            ),
            dataZoom: [...BASE.dataZoom]
        });
        cinit('ch-h2', {
            ...BASE,
            legend: {
                ...BASE.legend,
                bottom: 28,
                data: ['Cores in Use']
            },
            grid: {
                ...BASE.grid,
                bottom: 76
            },
            xAxis: {
                ...BASE.xAxis,
                data: h.coreLabels,
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    interval: Math.floor(h.coreLabels.length / 8)
                }
            },
            yAxis: mkY('Cores in Use', {
                min: 0,
                max: h.maxLimit,
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => (+v).toFixed(1)
                }
            }),
            series: [{
                ...mkLn('Cores in Use', h.coresVals, '#94a3b8', {
                    smooth: true,
                    symbol: 'none',
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(148,163,184,0.2)'
                            }, {
                                offset: 1,
                                color: 'rgba(148,163,184,0.01)'
                            }]
                        }
                    },
                    markLine: {
                        silent: true,
                        lineStyle: {
                            color: '#ef4444',
                            type: 'dashed',
                            width: 1.5
                        },
                        data: [{
                            yAxis: +(h.maxLimit * 0.75).toFixed(2)
                        }],
                        label: {
                            formatter: `${(h.maxLimit * 0.75).toFixed(1)} (75% plan)`,
                            fontSize: 9,
                            color: '#ef4444'
                        }
                    }
                })
            }],
            dataZoom: [...BASE.dataZoom]
        });
        // Memory hourly overlay — display in GB (plan-immune).
        const mh = buildMemoryHourly();
        if (mh)
            cinit('ch-hmem', {
                ...BASE,
                legend: {
                    show: false
                },
                grid: {
                    ...BASE.grid,
                    bottom: 38
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: mh.labels,
                    axisLabel: {
                        ...BASE.xAxis.axisLabel,
                        interval: Math.floor(mh.labels.length / 8)
                    }
                },
                yAxis: mkY('Memory (GB)', {
                    min: 0,
                    max: mh.limitGb || Math.max(...mh.gbVals, 1) * 1.1,
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => `${(+v).toFixed(1)}`
                    }
                }),
                series: [{
                    name: 'Memory (GB)',
                    type: 'line',
                    data: mh.gbVals,
                    symbol: 'none',
                    smooth: true,
                    lineStyle: {
                        color: '#a78bfa',
                        width: 2
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(167,139,250,0.22)'
                            }, {
                                offset: 1,
                                color: 'rgba(167,139,250,0.01)'
                            }]
                        }
                    },
                    markLine: mh.limitGb ? {
                        silent: true,
                        lineStyle: {
                            color: '#ef4444',
                            type: 'dashed',
                            width: 1.5
                        },
                        data: [{
                            yAxis: +(mh.limitGb * 0.85).toFixed(2)
                        }],
                        label: {
                            formatter: `${(mh.limitGb * 0.85).toFixed(1)} GB (85%)`,
                            fontSize: 9,
                            color: '#ef4444'
                        }
                    } : undefined
                }],
                dataZoom: [...BASE.dataZoom]
            });
    }
    ;

    const initTrend3min = () => {
        const raw = CAP.core_3min;
        if (!raw)
            return;
        const pts = raw.data.points || [];
        const lims = raw.data.limits_list || [];
        const ml = lims.length ? Math.max(...lims.map(p => +p.value)) : 9;
        // Cores in use at 15-sec resolution (raw API % of one core ÷ 100).
        const coresVals = pts.map(p => +((+p.value) / 100).toFixed(3));
        cinit('ch-3m', {
            ...BASE,
            legend: {
                show: false
            },
            grid: {
                ...BASE.grid,
                bottom: 56
            },
            xAxis: {
                ...BASE.xAxis,
                data: pts.map(p => new Date(+p.timestamp * 1000).toLocaleTimeString('en-IE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })),
                axisLabel: {
                    ...BASE.xAxis.axisLabel,
                    interval: Math.floor(pts.length / 8),
                    rotate: 0
                }
            },
            yAxis: mkY('Cores in Use', {
                min: 0,
                max: Math.max(ml, Math.max(...coresVals) * 1.05),
                axisLabel: {
                    ...BASE.yAxis.axisLabel,
                    formatter: v => (+v).toFixed(1)
                }
            }),
            series: [{
                type: 'line',
                data: coresVals,
                symbol: 'none',
                smooth: false,
                lineStyle: {
                    color: '#27AAE1',
                    width: 1.5
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(39,170,225,0.35)'
                        }, {
                            offset: 1,
                            color: 'rgba(96,165,250,0.02)'
                        }]
                    }
                },
                markLine: {
                    silent: true,
                    lineStyle: {
                        color: '#ef4444',
                        type: 'dashed',
                        width: 2
                    },
                    data: [{
                        yAxis: +(ml * 0.75).toFixed(2)
                    }, {
                        yAxis: +(ml * 0.5).toFixed(2)
                    }],
                    label: {
                        formatter: p => p.value === +(ml * 0.75).toFixed(2) ? `${(ml * 0.75).toFixed(1)} (75%)` : `${(ml * 0.5).toFixed(1)} (50%)`,
                        color: '#ef4444',
                        fontSize: 9
                    }
                }
            }],
            dataZoom: [{
                type: 'inside',
                zoomOnMouseWheel: 'shift',
                moveOnMouseWheel: false
            }]
        });
        // Memory 3min chart — display in GB (plan-immune).
        if (CAP.mem_3min?.data?.points_series?.points_real) {
            const mPts = CAP.mem_3min.data.points_series.points_real;
            const mLims = CAP.mem_3min.data.limits_list || [];
            const planGb = mLims.length ? +mLims[mLims.length - 1].value : null;
            const gbVals = mPts.map(p => +(+p.value).toFixed(2));
            const yMax = planGb || Math.max(...gbVals, 1) * 1.1;
            cinit('ch-3m-mem', {
                ...BASE,
                legend: {
                    show: false
                },
                grid: {
                    ...BASE.grid,
                    bottom: 56
                },
                xAxis: {
                    ...BASE.xAxis,
                    data: mPts.map(p => new Date(+p.timestamp * 1000).toLocaleTimeString('en-IE', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })),
                    axisLabel: {
                        ...BASE.xAxis.axisLabel,
                        interval: Math.floor(mPts.length / 8),
                        rotate: 0
                    }
                },
                yAxis: mkY('Memory (GB)', {
                    min: 0,
                    max: yMax,
                    axisLabel: {
                        ...BASE.yAxis.axisLabel,
                        formatter: v => `${(+v).toFixed(1)}`
                    }
                }),
                series: [{
                    type: 'line',
                    data: gbVals,
                    symbol: 'none',
                    smooth: false,
                    lineStyle: {
                        color: '#a78bfa',
                        width: 1.5
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(167,139,250,0.35)'
                            }, {
                                offset: 1,
                                color: 'rgba(167,139,250,0.02)'
                            }]
                        }
                    },
                    markLine: planGb ? {
                        silent: true,
                        lineStyle: {
                            color: '#ef4444',
                            type: 'dashed',
                            width: 2
                        },
                        data: [{
                            yAxis: +(planGb * 0.85).toFixed(2)
                        }, {
                            yAxis: +(planGb * 0.7).toFixed(2)
                        }],
                        label: {
                            formatter: p => p.value === +(planGb * 0.85).toFixed(2) ? `${(planGb * 0.85).toFixed(1)} GB (85%)` : `${(planGb * 0.7).toFixed(1)} GB (70%)`,
                            color: '#ef4444',
                            fontSize: 9
                        }
                    } : undefined
                }],
                dataZoom: [{
                    type: 'inside',
                    zoomOnMouseWheel: 'shift',
                    moveOnMouseWheel: false
                }]
            });
        }
    }
    ;

    // ── RAW TAB ───────────────────────────────────────────────────────────────
    const renderRaw = data => {
        const body = document.getElementById('sgd-body');
        const gs = groupSites(data, S.ui.group);
        const rows = data.dailyRows.map(row => {
            const lim = row.limit || 9;
            // Cores in use that day = raw API value / 100. Threshold: 75% of plan.
            const coresUsed = data.coresUsedMap.get(row.date) ?? (row.corePct / 100);
            const over = coresUsed > lim * 0.75;
            const inc = data.incompleteDates.has(row.date);
            const memGb = data.memDailyGbMap?.get(row.date);
            const memLimGb = data.memLimitGbMap?.get(row.date) || data.currentMemLimitGb;
            const memOver = memGb != null && memLimGb && memGb > memLimGb * 0.85;
            const cells = gs.map(s => `<td class="r">${fmtN(row[s.domain] || 0)}</td>${data.hasExec ? `<td class="r cd">${fmtN(row['ex_' + s.domain] || 0)}</td>` : ''}`).join('');
            return `<tr class="${inc ? 'incomplete' : ''}"><td>${esc(row.date)}${inc ? `<span class="inc-badge">partial</span>` : ''}</td><td class="r">${fmtN(row.accountCpu)}</td><td class="r ${over ? 'cr' : ''}">${fmtD(coresUsed, 2)} / ${lim}</td>${data.hasMem ? `<td class="r ${memOver ? 'cr' : ''}">${memGb != null ? fmtD(memGb, 2) + ' GB' + (memLimGb ? ` / ${memLimGb}` : '') : '—'}</td>` : ''}${data.hasExec ? `<td class="r">${fmtN(row.accountExec || 0)}</td>` : ''}${cells}</tr>`;
        }
        );
        const ths = gs.map(s => `<th class="r" title="${esc(s.domain)}">${esc(s.domain.split('.')[0])}</th>${data.hasExec ? '<th class="r cd">exec</th>' : ''}`).join('');
        body.innerHTML = `${introCard('raw')}<div class="ctrl-row">${groupCtrl()}<button class="btn sec" data-a="export">Export CSV</button></div>
    <div class="sec"><div class="sec-t">Daily data — ${data.dates.length} rows · ${gs.length} sites · cores are plan-immune (same number on 7- or 9-core plan)</div>
    <div class="tw"><table><thead><tr><th>Date</th><th class="r">Acct CPU</th><th class="r" ${tipAttr('core_pct')}>Cores Used</th>${data.hasMem ? '<th class="r">Memory (GB)</th>' : ''}${data.hasExec ? '<th class="r">Acct Exec</th>' : ''}${ths}</tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`;
    }
    ;

    // ── EVENTS + NAV ──────────────────────────────────────────────────────────
    const killCharts = () => {
        Object.values(S.ui.charts).forEach(c => {
            try {
                c.dispose();
            } catch {}
        }
        );
        S.ui.charts = {};
    }
    ;
    const renderTab = data => {
        // Guide tab is a static glossary, works even when no data has been captured yet.
        if (!data && S.ui.tab !== 'guide')
            return;
        killCharts();
        const t = S.ui.tab;
        if (t === 'health')
            renderHealth(data);
        else if (t === 'sites')
            renderSites(data);
        else if (t === 'compare')
            renderCompare(data);
        else if (t === 'trends')
            renderTrends(data);
        else if (t === 'raw')
            renderRaw(data);
        else if (t === 'guide')
            renderGuide(data);
    }
    ;
    // ── GUIDE TAB ────────────────────────────────────────────────────────────
    // Full glossary. Renders the GUIDE structure as a vertical TOC + section blocks.
    // Both layman and technical descriptions are always visible — that's the whole point.
    const renderGuide = (data) => {
        const body = document.getElementById('sgd-body');
        const toc = GUIDE.map(sec => `<a href="#g-${esc(sec.section.replace(/\s+/g, '-').toLowerCase())}" class="guide-toc-link">${esc(sec.section)} <span class="cd">${sec.items.length}</span></a>`).join('');
        const sections = GUIDE.map(sec => {
            const id = sec.section.replace(/\s+/g, '-').toLowerCase();
            const items = sec.items.map(it => `
        <div class="guide-item" id="g-${esc(it.key)}">
          <div class="guide-item-h">
            <div class="guide-item-title">${esc(it.title)}</div>
            <code class="guide-item-key">${esc(it.key)}</code>
          </div>
          <div class="guide-block layman">
            <div class="guide-block-h">In plain English</div>
            <div class="guide-block-body">${it.layman}</div>
          </div>
          <div class="guide-block tech">
            <div class="guide-block-h">Technically</div>
            <div class="guide-block-body">${it.technical}</div>
          </div>
          <div class="guide-block when">
            <div class="guide-block-h">When it matters</div>
            <div class="guide-block-body">${it.whenItMatters}</div>
          </div>
          <div class="guide-block where">
            <div class="guide-block-h">Where on the dashboard</div>
            <div class="guide-block-body">${it.whereToFind}</div>
          </div>
          ${it.severity ? `<div class="guide-block sev"><div class="guide-block-h">Thresholds</div><div class="guide-block-body">${it.severity}</div></div>` : ''}
        </div>`).join('');
            return `<section class="guide-section" id="g-${esc(id)}">
        <h2 class="guide-section-h">${esc(sec.section)}</h2>
        <div class="guide-items">${items}</div>
      </section>`;
        }
        ).join('');
        body.innerHTML = `
    <div class="guide-wrap">
      <aside class="guide-toc">
        <div class="guide-toc-h">Contents</div>
        ${toc}
        <div class="guide-toc-foot">
          <strong>📖 Explain mode</strong> in the header toggles plain-English subtitles on every section. Hover any <span class="ticon" style="display:inline-flex;width:13px;height:13px;font-size:8px">?</span> in the dashboard for the same content as a quick tooltip.
        </div>
      </aside>
      <div class="guide-content">
        <div class="guide-intro">
          <h1>📘 Dashboard Guide</h1>
          <p>Every metric explained twice: in plain English first, then technically. Plus when it matters and where to find it. Use this when something on the dashboard doesn't make sense.</p>
        </div>
        ${sections}
      </div>
    </div>`;
    }
    ;

    const exportCsv = () => {
        const data = S.data;
        if (!data)
            return;
        const gs = groupSites(data, S.ui.group);
        const rows = data.dailyRows.map(row => {
            const memGb = data.memDailyGbMap?.get(row.date);
            const memLimGb = data.memLimitGbMap?.get(row.date) || data.currentMemLimitGb;
            const coresUsed = data.coresUsedMap.get(row.date) ?? (row.corePct / 100);
            const lim = row.limit || 9;
            const b = {
                date: row.date,
                account_cpu: Math.round(row.accountCpu),
                cores_used: +coresUsed.toFixed(3),
                core_limit: lim,
                pct_of_plan: +((coresUsed / lim) * 100).toFixed(2),
                ...(data.hasMem ? {
                    memory_gb: memGb != null ? +memGb.toFixed(2) : '',
                    memory_limit_gb: memLimGb ?? '',
                    memory_pct_of_plan: (memGb != null && memLimGb) ? +((memGb / memLimGb) * 100).toFixed(2) : ''
                } : {}),
                ...(data.hasExec ? {
                    account_exec: Math.round(row.accountExec || 0)
                } : {})
            };
            gs.forEach(s => {
                b[s.domain.replace(/[.\-]/g, '_')] = Math.round(row[s.domain] || 0);
                if (data.hasExec)
                    b['exec_' + s.domain.replace(/[.\-]/g, '_')] = Math.round(row['ex_' + s.domain] || 0);
            }
            );
            return b;
        }
        );
        const keys = Object.keys(rows[0]);
        // Brand preamble — RFC-4180-safe (# comments are ignored by most CSV consumers; Excel
        // shows them as a single-cell row but doesn't choke). Identifies provenance, parameters,
        // and the Cobblestone contact details required by the brand spec.
        const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        const preamble = ['# Cobblestone Learning — SiteGround CPU Report', '# Learning. Creativity. Trust.', `# Generated: ${stamp}`, `# Period: ${data.dates[0]} to ${data.dates[data.dates.length - 1]} (${data.dates.length} days)`, `# Plan: ${data.currentCoreLimit} cores, ${data.currentMemLimitGb}GB memory${data.planChanges?.length ? ` (changed during period: ${data.planChanges.map(c => `${c.kind} ${c.fromVal}→${c.toVal} on ${c.date}`).join('; ')})` : ''}`, `# Account total CPU (sum): ${fmtN(data.acctTotal)} CPU sec`, `# Active sites: ${data.activeSites?.length ?? '?'}; dead/parked: ${data.deadSites?.length ?? '?'}; excluded by user: ${S.ui.excludedSites.size}`, '# Cobblestone Learning, 5 Lombard Street, Dublin 2, Ireland · info@cobblestonelearning.com · +353 1 908 1582', '#'].join('\n');
        const csv = preamble + '\n' + [keys, ...rows.map(r => keys.map(k => `"${String(r[k]).replace(/"/g, '""')}"`))].map(r => r.join(',')).join('\n');
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv],{
                type: 'text/csv'
            })),
            download: `cobblestone-sg-cpu-${new Date().toISOString().slice(0, 10)}.csv`
        });
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    ;

    // Downloads every raw SiteGround API payload the dashboard has captured into a single
    // JSON bundle. Useful for sharing the source data with someone (e.g. Claude) who wants
    // to re-derive the dashboard's numbers from the original `aggregated_site_stats_responses`.
    // We also split each capture into its own file so they can be inspected individually.
    const downloadRawCaptures = () => {
        const present = Object.keys(CAP).filter(k => CAP[k]);
        const missing = Object.keys(CAP).filter(k => !CAP[k]);
        if (!present.length) {
            alert('No raw API captures yet. Open SiteGround Site Tools → Statistics views first so the dashboard can intercept the responses.');
            return;
        }
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const triggerDownload = (filename, payload) => {
            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), {
                href: url,
                download: filename
            });
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout( () => URL.revokeObjectURL(url), 1500);
        }
        ;
        // 1) Always emit the combined bundle first — one file is easiest to share.
        const bundle = {
            captured_at: new Date().toISOString(),
            location_href: location.href,
            keys_present: present,
            keys_missing: missing,
            data: present.reduce( (a, k) => (a[k] = CAP[k],
            a), {})
        };
        triggerDownload(`sg-raw-bundle-${stamp}.json`, bundle);
        // 2) Then a separate file per capture, staggered so the browser allows the burst.
        present.forEach( (k, i) => setTimeout( () => triggerDownload(`sg-raw-${k}-${stamp}.json`, CAP[k]), 200 + i * 180));
        const status = document.getElementById('sgd-st');
        if (status)
            status.textContent = `Downloading ${present.length + 1} raw API file${present.length ? 's' : ''} (1 bundle + ${present.length} individual)…${missing.length ? ` Missing: ${missing.join(', ')}.` : ''}`;
    }
    ;

    const copySummary = async () => {
        const txt = document.getElementById('sum-box')?.textContent;
        if (!txt) {
            alert('Run the Before/After analysis first to generate a summary.');
            return;
        }
        try {
            await navigator.clipboard.writeText(txt);
            alert('Copied.');
        } catch {
            console.log(txt);
            alert('Clipboard blocked — printed to console.');
        }
    }
    ;

    const bindEvents = root => {
        root.addEventListener('click', e => {
            // Theme toggle
            if (e.target?.closest('#sgd-theme-toggle')) {
                const next = S.ui.theme === 'light' ? 'dark' : 'light';
                setTheme(next);
                const btn = root.querySelector('#sgd-theme-toggle');
                if (btn)
                    btn.textContent = next === 'light' ? '🌙' : '☀️';
                // ECharts canvases are painted with init-time colours, so re-render the active tab to
                // re-theme them — otherwise the charts stay in the old palette until the next tab switch.
                if (S.data || S.ui.tab === 'guide')
                    renderTab(S.data);
                return;
            }
            // Explain-mode toggle: flips the .explain-off class on root. layman-sub elements
            // are display:none under .explain-off, so toggling reveals/hides every subtitle at once.
            if (e.target?.closest('#sgd-explain-toggle')) {
                S.ui.explain = !S.ui.explain;
                try {
                    localStorage.setItem('sgd_explain', S.ui.explain ? '1' : '0');
                } catch {}
                root.classList.toggle('explain-off', !S.ui.explain);
                const btn = root.querySelector('#sgd-explain-toggle');
                if (btn)
                    btn.classList.toggle('on', S.ui.explain);
                return;
            }
            // Site-exclusion chip: click opens the inclusion/exclusion panel directly so
            // the user can toggle any site from anywhere in the app without leaving the
            // current tab. Per-row exclude buttons on the Sites tab still work too.
            if (e.target?.closest('#sgd-excl-chip')) {
                if (S.data)
                    openSiteInclusionPanel(S.data, () => renderTab(S.data));
                return;
            }
            // Excluded-from-network banner on the Before/After tab also opens the panel.
            if (e.target?.closest('.excl-banner')) {
                if (S.data)
                    openSiteInclusionPanel(S.data, () => renderTab(S.data));
                return;
            }
            // Per-row exclude toggle (Sites tab) or banner pill remove. Re-derive siteStats
            // (the isExcluded flag is set at build-time) and re-render the active tab.
            const exclBtn = e.target?.closest('[data-excl-toggle]');
            if (exclBtn) {
                toggleExcluded(exclBtn.dataset.exclToggle);
                if (S.data)
                    S.data.siteStats.forEach(s => s.isExcluded = isExcluded(s.domain));
                root.querySelector('#sgd-excl-count').textContent = S.ui.excludedSites.size;
                root.querySelector('#sgd-excl-chip').classList.toggle('has', S.ui.excludedSites.size > 0);
                renderTab(S.data);
                return;
            }
            if (e.target?.closest('[data-excl-clear]')) {
                clearExclusions();
                if (S.data)
                    S.data.siteStats.forEach(s => s.isExcluded = false);
                root.querySelector('#sgd-excl-count').textContent = '0';
                root.querySelector('#sgd-excl-chip').classList.remove('has');
                renderTab(S.data);
                return;
            }
            const tab = e.target?.dataset?.tab;
            if (tab) {
                S.ui.tab = tab;
                root.querySelectorAll('.sgd-tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tab));
                renderTab(S.data);
                return;
            }
            const act = e.target?.closest('[data-a]')?.dataset?.a;
            if (act === 'close') {
                killCharts();
                root.remove();
                document.getElementById('sgd-tt')?.remove();
            }
            if (act === 'reload') {
                if (CAP.sec_daily && CAP.core_daily)
                    onDataReady();
                else
                    run();
            }
            if (act === 'export')
                exportCsv();
            if (act === 'copy')
                copySummary();
            if (act === 'dl-raw')
                downloadRawCaptures();
            if (act === 'run-cmp')
                renderCmpOut(S.data);
            // Header "📄 Report" — dispatches to the right document generator for the current tab.
            if (act === 'gen-report-current') {
                if (!S.data) {
                    alert('No data loaded yet.');
                    return;
                }
                const t = S.ui.tab;
                if (t === 'health')
                    generateHealthReport(S.data);
                else if (t === 'sites')
                    generateSitesReport(S.data);
                else if (t === 'compare') {
                    const target = document.getElementById('cmp-tgt')?.value || S.ui.target;
                    const fixDate = document.getElementById('cmp-fix')?.value || S.ui.fixDate;
                    const daysBefore = +(document.getElementById('cmp-before')?.value || S.ui.daysBefore);
                    const daysAfter = +(document.getElementById('cmp-after')?.value || S.ui.daysAfter);
                    const ctrlPreset = document.getElementById('cmp-ctrl')?.value || S.ui.ctrlPreset;
                    const ctrlDoms = (ctrlPreset === 'auto' && S.ui.frozenCtrl?.length) ? S.ui.frozenCtrl : resolveCtrl(S.data, target, ctrlPreset);
                    const cmpOpts = buildCmpOptsFromUI(fixDate);
                    const cmp = buildCmp(S.data, target, fixDate, daysBefore, daysAfter, ctrlDoms, cmpOpts);
                    const fixFocus = document.getElementById('cmp-focus')?.value || S.ui.fixFocus || 'auto';
                    const interp = interpret(cmp, target, fixFocus, S.data);
                    generateBrandedReport(S.data, cmp, target, fixDate, ctrlDoms, interp, fixFocus);
                } else if (t === 'trends' || t === 'raw' || t === 'guide') {
                    // No bespoke trends/raw/guide report yet — default to the Sites Overview as the
                    // closest analytical document, since trends and raw are tabular views of similar data.
                    generateSitesReport(S.data);
                } else {
                    alert('Switch to a content tab (Health, Sites, or Before/After) to generate a report.');
                }
            }
            const sort = e.target?.dataset?.sort;
            if (sort) {
                if (S.ui.sortKey === sort)
                    S.ui.sortDir *= -1;
                else {
                    S.ui.sortKey = sort;
                    S.ui.sortDir = -1;
                }
                renderTab(S.data);
            }
            const step = e.target?.dataset?.step;
            if (step && !e.target.disabled) {
                S.ui.viewStep = step;
                renderTab(S.data);
            }
            const sp = e.target?.closest('[data-sp]')?.dataset?.sp;
            if (sp) {
                S.ui.selectedSites.has(sp) ? S.ui.selectedSites.delete(sp) : S.ui.selectedSites.add(sp);
                renderTab(S.data);
            }
            const drill = e.target?.closest('[data-drill]')?.dataset?.drill;
            if (drill && S.data) {
                openSiteDrilldown(S.data, drill);
            }
        }
        );
        root.addEventListener('change', e => {
            if (e.target?.id === 'sgd-group') {
                S.ui.group = e.target.value;
                S.ui.selectedSites.clear();
                renderTab(S.data);
            }
            if (e.target?.id === 'show-avg') {
                S.ui.showAvgLine = e.target.checked;
                renderTab(S.data);
            }
        }
        );
        initTooltips(root);
    }
    ;

    // ── INIT ──────────────────────────────────────────────────────────────────
    // Wait panel: shows the user exactly which SG reports the dashboard still needs.
    // Each SG panel (CPU Seconds, Executions, Core, Memory) groups the views you must cycle.
    // Auto-closes when all 10 are green; "Open Anyway" reveals the dashboard with partial data;
    // "Dismiss" gives up entirely.
    const WAIT_GROUPS = [{
        title: '📊 CPU Seconds',
        panel: 'Site Tools → Statistics → CPU Seconds',
        items: [{
            k: 'sec_daily',
            l: 'Last Month'
        }, {
            k: 'sec_hourly',
            l: 'Last 24 Hours'
        }]
    }, {
        title: '⚙️ Program Executions',
        panel: 'Site Tools → Statistics → Program Executions',
        items: [{
            k: 'exec_daily',
            l: 'Last Month'
        }, {
            k: 'exec_hourly',
            l: 'Last 24 Hours'
        }]
    }, {
        title: '🔥 CPU Core Usage',
        panel: 'Site Tools → Statistics → CPU Core Usage',
        items: [{
            k: 'core_daily',
            l: 'Last Month'
        }, {
            k: 'core_hourly',
            l: 'Last 24 Hours'
        }, {
            k: 'core_3min',
            l: 'Last 30 Min'
        }]
    }, {
        title: '🧠 Memory Usage',
        panel: 'Site Tools → Statistics → Memory Usage',
        items: [{
            k: 'mem_daily',
            l: 'Last Month'
        }, {
            k: 'mem_hourly',
            l: 'Last 24 Hours'
        }, {
            k: 'mem_3min',
            l: 'Last 30 Min'
        }]
    }, ];

    const renderWaitGroups = () => {
        const captured = REQUIRED.filter(k => CAP[k]).length;
        const total = REQUIRED.length;
        return `<div class="sgd-wait-progress"><b>${captured}</b> of ${total} reports captured${captured === total ? ' — opening dashboard…' : ''}</div>` + WAIT_GROUPS.map(g => {
            const done = g.items.every(i => CAP[i.k]);
            const cnt = g.items.filter(i => CAP[i.k]).length;
            return `<div class="sgd-wait-grp">
        <div class="sgd-wait-grp-t">${esc(g.title)}<span class="badge-need ${done ? 'badge-done' : ''}">${cnt}/${g.items.length}</span></div>
        <div class="sgd-wait-items">${g.items.map(i => `<span class="sgd-wait-item ${CAP[i.k] ? 'on' : ''}"><span class="ck">${CAP[i.k] ? '✓' : '○'}</span>${esc(i.l)}</span>`).join('')}</div>
      </div>`;
        }
        ).join('');
    }
    ;

    const refreshWaitPanel = () => {
        const p = document.getElementById('sgd-wait-panel');
        if (!p)
            return;
        const slot = p.querySelector('#sgd-wait-checklist');
        if (slot)
            slot.innerHTML = renderWaitGroups();
        const openBtn = p.querySelector('#sgd-open-dash');
        if (openBtn) {
            const minOk = minRequiredCaptured();
            const allOk = allRequiredCaptured();
            openBtn.classList.toggle('dim', !minOk);
            openBtn.disabled = !minOk;
            openBtn.textContent = allOk ? '✓ Open Dashboard (all 10 captured)' : minOk ? `Open Dashboard (${REQUIRED.filter(k => CAP[k]).length}/${REQUIRED.length})` : `Capture at least CPU + Core Last Month first`;
            openBtn.classList.toggle('btn-pulse', allOk);
        }
    }
    ;

    const showWaitPanel = root => {
        root.classList.add('waiting');
        const p = document.createElement('div');
        p.className = 'sgd-wait';
        p.id = 'sgd-wait-panel';
        p.setAttribute('data-theme', S.ui.theme);
        p.innerHTML = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <img src="${CBL_LOGO}" alt="Cobblestone Learning" style="height:30px;width:auto;display:block">
      <div style="flex:1">
        <h3 style="margin:0;font-size:14px"><span class="dp"></span>SiteGround Reports</h3>
        <div style="font-size:9.5px;font-weight:600;color:var(--accent);letter-spacing:.08em;text-transform:uppercase;margin-top:2px">Learning · Creativity · Trust</div>
      </div>
      <button class="theme-toggle" id="sgd-wait-theme" title="Toggle light/dark">${S.ui.theme === 'light' ? '🌙' : '☀️'}</button>
    </div>
    <p>This dashboard waits for all 10 reports across 4 SG panels. Open each panel in <strong>Site Tools → Statistics</strong> and cycle through its views — each chip below turns green as we capture it. <strong>The dashboard never opens until you click the button.</strong></p>
    <div id="sgd-wait-checklist">${renderWaitGroups()}</div>
    <div class="sgd-wait-acts">
      <button class="btn dim" id="sgd-open-dash" title="Render the dashboard">Open Dashboard</button>
      <button class="btn sec sm" id="sgd-dismiss" style="flex:0 0 auto" title="Close the dashboard entirely">✕</button>
    </div>`;
        document.body.appendChild(p);
        refreshWaitPanel();
        p.querySelector('#sgd-wait-theme').onclick = () => {
            const next = S.ui.theme === 'light' ? 'dark' : 'light';
            setTheme(next);
            p.setAttribute('data-theme', next);
            p.querySelector('#sgd-wait-theme').textContent = next === 'light' ? '🌙' : '☀️';
        }
        ;
        p.querySelector('#sgd-dismiss').onclick = () => {
            p.remove();
            root.remove();
        }
        ;
        p.querySelector('#sgd-open-dash').onclick = () => {
            if (!minRequiredCaptured()) {
                alert('Need at least CPU Seconds → Last Month and CPU Core Usage → Last Month to render anything useful.');
                return;
            }
            onCaptured?.();
        }
        ;
    }
    ;

    const loadECharts = () => new Promise( (res, rej) => {
        if (window.echarts)
            return res();
        const s = Object.assign(document.createElement('script'), {
            src: CFG.echartsUrl
        });
        s.onload = res;
        s.onerror = () => rej(new Error('ECharts failed — check access to cdnjs.cloudflare.com'));
        document.head.appendChild(s);
    }
    );

    const onDataReady = () => {
        try {
            S.data = buildData(CAP.sec_daily, CAP.core_daily, CAP.exec_daily);
            // Persist daily rollups for cross-session comparison
            try {
                const memByDate = {};
                CAP.mem_daily?.data?.points?.forEach(p => {
                    memByDate[tsDate(p.timestamp)] = +p.value;
                }
                );
                S.history = persistDailyRollup(S.data, {
                    byDate: memByDate
                });
                persistHourlyRollup();
            } catch (err) {
                console.warn('[sgd] persistence skipped', err);
            }
            const liveCores = getLiveCores();
            const limit = getCoreLimit();
            const pL = (liveCores !== null && limit) ? (liveCores / limit) * 100 : 0;
            const liveMemGb = getLiveMemGb();
            const memLim = getMemLimit();
            setSt(`${S.data.dates.length} days · ${S.data.siteStats.filter(s => s.total > 0).length} active · ${fmtN(S.data.acctTotal)} total CPU sec${S.data.incompleteDates.size ? ` · <span class="cw2">${S.data.incompleteDates.size} partial day excluded</span>` : ''}${liveCores !== null ? ` · Cores: <strong>${liveCores.toFixed(2)}/${limit}</strong>` : ''}${liveMemGb !== null ? ` · Mem: <strong>${liveMemGb.toFixed(2)}${memLim ? '/' + memLim : ''} GB</strong>` : ''}`, pL > 75 ? 'crit' : pL > 60 ? 'warn' : 'ok');
            setAcct();
            updateAvailUI();
            renderTab(S.data);
        } catch (err) {
            console.error('[sgd]', err);
            setSt(esc(err.message || String(err)), 'crit');
        }
    }
    ;

    const run = async () => {
        // Version banner on load — brand-coloured pill in the console (Cobblestone blue/cyan/dark).
        console.log(`%c Better SG Reports %c v${SGD_VERSION} %c ${SGD_RELEASE} `, 'background:#0074B4;color:#fff;font-weight:700;border-radius:3px 0 0 3px;padding:2px 7px', 'background:#27AAE1;color:#fff;font-weight:700;padding:2px 7px', 'background:#3D3D3D;color:#fff;padding:2px 7px;border-radius:0 3px 3px 0');
        installInterceptor();
        const root = setupRoot();
        bindEvents(root);
        try {
            setSt('Loading ECharts…');
            await loadECharts();
        } catch (err) {
            setSt(esc(err.message || String(err)), 'crit');
            return;
        }
        onCaptured = () => {
            document.getElementById('sgd-wait-panel')?.remove();
            const r = document.getElementById('sgd');
            if (r)
                r.classList.remove('waiting');
            onDataReady();
        }
        ;
        // Always restore as much as we can from session cache, but never auto-open.
        // The user is in control: the wait panel stays up until they click "Open Dashboard".
        setSt('Scanning session cache for previously-loaded SG reports…');
        await tryRefetchFromPerf();
        showWaitPanel(root);
    }
    ;

    // ── TEST / EMBED HOOK ─────────────────────────────────────────────────────
    // Browser (bookmarklet / console paste): `window` exists → auto-run the UI as always.
    // Node (test harness in /test): no `window`, but `module` exists → export the pure
    // calculation + analysis functions for headless unit testing. The two environments are
    // mutually exclusive in practice, so neither path interferes with the other.
    const __SGD_TESTABLE__ = {
        buildData, buildCmp, baseline, classifyVsBaseline, linReg, projectCross, welchT, studentTp, oneSampleT, lag1Acf,
        percentile, pctCh, avg, avgAll, focusSeries, focusNarrative, focusMetric, focusRanking, interpret,
        resolveCtrl, rankByMetric, categorise, tsDate, addDays, renderTab, renderCmpOut,
        buildActivityMatrix, buildCoreHourMatrix, getCoreLimit, SGD_VERSION, SGD_RELEASE, CFG, CAP, S
    };
    if (typeof window !== 'undefined') {
        // Only expose internals when a harness explicitly opts in (window.__SGD_TEST__ set
        // before this script loads) — keeps the normal bookmarklet path from polluting window.
        if (window.__SGD_TEST__)
            window.__SGD_TESTABLE__ = __SGD_TESTABLE__;
        run();
    }
    if (typeof module !== 'undefined' && module.exports)
        module.exports = __SGD_TESTABLE__;
}
)();
