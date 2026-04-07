# DigiLocker Mobile (Document Management App)
## Comparison of AI Coding Tools for WT Assignment

### Project Context
For this comparison, I built the same app idea (DigiLocker Mobile – Document Management App) using four tools: **Cursor**, **Lovable**, **Replit AI**, and **Windsurf**.  
I compared them based on actual development experience, not just first impressions.

---

## 1) Comparison Table

| Metric | Cursor | Lovable | Replit AI | Windsurf |
|---|---|---|---|---|
| **Code quality (cleanliness, modularity)** | Very good structure, better separation of components/hooks | Good for quick UI flow, but code can be less modular | Decent starter code, but often needs cleanup | Good quality, sometimes over-engineered suggestions |
| **Development speed** | Fast once project context is set | Very fast for UI-first prototyping | Fast for small features, slows in bigger refactors | Fast in iterative coding, especially with context-aware edits |
| **UI/UX design capability** | Good, but mostly depends on prompts and manual polish | Strong point; gives attractive UI ideas quickly | Basic to moderate UI quality | Good balance of functional + modern UI suggestions |
| **Accuracy of generated code** | High for common patterns, occasional API mismatch | Medium; UI code is good, logic can break at edge cases | Medium; sometimes generic or outdated patterns | High-medium; mostly correct, but still needs review |
| **Ease of debugging** | Strong debugging workflow and code navigation | Debugging is more manual after generation | Basic debugging help; often needs manual tracing | Good at suggesting fixes, but not always root-cause focused |
| **Flexibility/customization** | High control for architecture and coding style | Moderate; best when following its generation flow | Moderate; good for quick edits but less deep control | High; supports iterative custom changes well |
| **Learning curve** | Medium (needs understanding of prompts + code context) | Easy for beginners | Very easy to start | Medium; easier if you already know project structure |
| **Performance of generated app** | Generally optimized if prompted properly | UI-heavy output may need performance tuning | Works fine for small builds; optimization is limited | Good performance baseline, but still needs manual optimization |

---

## 1.1) Extended Metrics (Practical Development View)

| Additional Metric | Cursor | Lovable | Replit AI | Windsurf |
|---|---|---|---|---|
| **Project context understanding** | Strong in multi-file projects | Good in flow-based generation, weaker in deep code context | Moderate, can lose context in larger codebases | Strong, especially in iterative edits |
| **Refactoring support** | Very good for component/state refactors | Basic to moderate | Moderate for smaller refactors | Good, but sometimes suggests extra complexity |
| **State management handling (React Native)** | Handles Zustand/Context patterns well | Works for simple state; complex cases need fixes | Often gives generic state logic | Good with common patterns, still needs review |
| **API integration reliability** | Mostly accurate with endpoint + error handling | Good structure, but misses edge-case handling sometimes | Can produce placeholder-like integration | Good baseline integration with decent error flow |
| **Testability of generated code** | Better function separation, easier to test | UI-first code needs restructuring for tests | Mixed; test setup often manual | Usually testable but may need cleanup |
| **Documentation/comments quality** | Clear when prompted | Minimal by default | Basic comments | Moderate to good |
| **Consistency across repeated prompts** | High consistency | Medium consistency | Medium-low consistency | High-medium consistency |
| **Hallucination rate (wrong imports/APIs)** | Low-medium | Medium | Medium-high | Low-medium |

---

## 1.2) Numeric Scorecard (Out of 10)

> These scores are based on my actual development experience in this project, so they are practical estimates (not lab measurements).

| Metric | Weight | Cursor | Lovable | Replit AI | Windsurf |
|---|---:|---:|---:|---:|---:|
| Code quality | 0.20 | 8.8 | 7.2 | 6.8 | 8.2 |
| Development speed | 0.15 | 8.4 | 9.0 | 8.3 | 8.5 |
| UI/UX capability | 0.10 | 7.8 | 9.1 | 7.0 | 8.1 |
| Accuracy of generated code | 0.20 | 8.6 | 7.1 | 6.9 | 8.0 |
| Ease of debugging | 0.10 | 8.5 | 6.8 | 6.7 | 7.9 |
| Flexibility/customization | 0.10 | 8.7 | 7.0 | 6.9 | 8.4 |
| Learning curve | 0.05 | 7.2 | 8.8 | 9.0 | 7.4 |
| App performance output | 0.10 | 8.3 | 7.0 | 6.8 | 8.0 |
| **Weighted overall score** | **1.00** | **8.45** | **7.67** | **7.20** | **8.15** |

### Quick ranking based on weighted score
1. **Cursor** (8.45)
2. **Windsurf** (8.15)
3. **Lovable** (7.67)
4. **Replit AI** (7.20)

---

## 1.3) Time and Rework Comparison (Realistic)

| Practical Indicator | Cursor | Lovable | Replit AI | Windsurf |
|---|---|---|---|---|
| **Approx. time to first working prototype** | Medium-fast | Fastest | Fast | Fast |
| **Manual bug fixing required after generation** | Low-medium | Medium-high | High | Medium |
| **Manual cleanup/refactor effort** | Low-medium | Medium | High | Medium |
| **Best phase of usage** | Core development + scaling | UI prototyping + demos | Early idea testing | Iterative build + polish |

Interpretation: Lovable and Replit AI saved the most initial time, but Cursor and Windsurf reduced rework in later stages. For assignment projects with deadlines, this trade-off matters a lot.

---

## 1.4) Best Tool by Scenario

| Scenario | Best Choice | Why |
|---|---|---|
| Need fast UI mock/demo in less time | **Lovable** | Strong UI generation and quick visual output |
| Need maintainable code for larger project | **Cursor** | Better structure, modularity, and refactoring support |
| Need simple starter code quickly | **Replit AI** | Easy onboarding and fast initial snippets |
| Need balanced daily coding assistant | **Windsurf** | Good mix of speed, context, and accuracy |

---

## 2) Short Real-Development Notes (2–3 lines each)

### Cursor
During development, Cursor felt most reliable for writing maintainable React Native code and handling refactors. It understood project context better when files were already organized. I still had to validate generated logic, but overall it reduced rework.

### Lovable
Lovable was very useful for quickly building attractive screens and getting a usable UI flow in less time. However, when business logic got complex (state, validation, edge cases), I had to manually correct several parts. It is strong for speed, less strong for deeper logic.

### Replit AI
Replit AI helped produce quick working snippets and was good for experimentation. In a larger app structure, code consistency and architecture needed manual fixes. It is practical for fast prototyping, but not always ideal for production-level structure.

### Windsurf
Windsurf performed well in iterative development and gave useful code completions across files. It was better than expected for balancing speed and code quality. Still, some suggestions looked correct at first but needed testing before final integration.

---

## 3) Realistic Strengths and Limitations

### Cursor
**Strengths:**
- Clean and modular code generation
- Good project-wide context handling
- Helpful in debugging and refactoring

**Limitations / Issues faced:**
- Needs precise prompts for best output
- Sometimes generates confident but slightly incorrect logic
- Beginner users may need time to use it effectively

### Lovable
**Strengths:**
- Very fast UI generation
- Great for building screens and visual flow
- Easy to use for non-experts

**Limitations / Issues faced:**
- Logic layer often needs manual correction
- Less control on deeper architecture decisions
- Edge-case handling is not always dependable

### Replit AI
**Strengths:**
- Quick start and easy setup
- Good for testing ideas and small modules
- Beginner-friendly coding support

**Limitations / Issues faced:**
- Code quality varies between prompts
- Refactoring large codebases is harder
- Generated patterns can be generic/outdated

### Windsurf
**Strengths:**
- Strong iterative coding assistance
- Good balance between speed and accuracy
- Useful for continuous edits in real project flow

**Limitations / Issues faced:**
- Occasional over-complex suggestions
- Needs developer validation for critical logic
- Some recommendations are not optimized by default

---

## 4) Final Conclusion (Student-Style)

After building the same DigiLocker Mobile project across all four tools, **Cursor was the best overall** for my use case. The main reason is that it gave cleaner code, better modular structure, and smoother debugging support during real development.

For **beginners**, **Lovable** or **Replit AI** is easier to start with because both give fast results and require less setup knowledge. For **advanced users** who care about architecture, maintainability, and long-term project quality, **Cursor** (and then **Windsurf**) is the better choice.

The weighted metric score also supports this result: Cursor performed best overall, while Windsurf came close as a strong second option for regular project work.

So in practical terms: if the goal is quick demo/prototype, Lovable/Replit works well; if the goal is a solid app codebase for long-term development, Cursor is the stronger option.
