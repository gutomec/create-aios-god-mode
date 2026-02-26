# Nirvana Squad Creator

> ينشئ فرق AIOS محسّنة من اللغة الطبيعية — خط أنابيب من 9 مرحلة يشمل التحليل والتوليد والتحسين والتحقق وملفات README متعددة اللغات والنشر والنشر على squads.sh.

## التثبيت

```bash
npx squads add gutomec/squads-sh-aios/nirvana-squad-creator
```

## ماذا يفعل

Nirvana Squad Creator هو **أداة وصفية**: فريق AIOS ينشئ فرق AIOS أخرى. انطلاقاً من هدف بالنغة الطبيعية، ينتج فريقاً كاملاً ومحسّناً يتضمن:

- **وكلاء** بشخصية وarchetype وcommands (AGENT-PERSONALIZATION-STANDARD-V1)
- **مهام** بعقود صريحة للمدخلات/المخرجات (TASK-FORMAT-SPECIFICATION-V1)
- **سير عمل** مع اختيار تلقائي للنمط والانتقالات
- **إعدادات** مكيّفة حسب المجال (coding-standards، tech-stack، source-tree)
- **ملفات README** بـ 6 لغات (PT-BR، en، zh، hi، es، ar)
- **نشر** على سوق squads.sh

صفر وكلاء زائدين. تحقق في 6 فئات. نشر تلقائي مع تفعيل أوامر slash.

## خط الأنابيب — 9 مرحلة

| المرحلة | الوكيل | الدور | النموذج |
|---------|--------|-------|---------|
| 0 | المنسّق | يجمع المدخلات، يبدأ الجلسة | — |
| 1 | 🔍 Analyzer | يحلل المتطلبات، ينشئ component-registry | Sonnet |
| 2 | 🏗️ AgentCreator | ينشئ تعريفات وكلاء AIOS | Opus |
| 3 | 📋 TaskCreator | ينشئ مهام بعقود مدخلات/مخرجات | Opus |
| 4 | 🔄 WorkflowCreator | ينشئ سير العمل، squad.yaml، الإعدادات | Opus |
| 5 | ⚡ Optimizer | AgentDropout، المراجع التبادلية، التسمية | Opus |
| 6 | ✅ Validator | تحقق من 6 فئات AIOS | Sonnet |
| 7 | 🌐 ReadmeCreator | ملفات README بـ 6 لغات | Opus |
| 8 | — Deploy | ينشر في مشروع AIOS، يفعّل الأوامر | المنسّق |
| 9 | 🚀 Publisher | ينشر على squads.sh (اختياري) | المنسّق |

## الوكلاء

| الرمز | الاسم | Archetype | المسؤولية |
|-------|-------|-----------|-----------|
| 🔍 | Analyzer | Guardian | يفكك الهدف إلى مجال وقدرات وأدوار |
| 🏗️ | AgentCreator | Builder | ينشئ تعريفات الوكلاء مع persona_profile |
| 📋 | TaskCreator | Builder | ينشئ مهام بعقود مدخلات/مخرجات متسلسلة |
| 🔄 | WorkflowCreator | Flow_Master | ينشئ سير العمل، squad.yaml، الإعدادات وREADME |
| ⚡ | Optimizer | Balancer | يزيل التكرار، يصحح المراجع التبادلية |
| ✅ | Validator | Guardian | يتحقق من 6 فئات مواصفات AIOS |
| 🌐 | ReadmeCreator | Builder | ينشئ README بالبرتغالية + 5 ترجمات |
| 🚀 | Publisher | Flow_Master | يوجّه النشر على سوق squads.sh |

## المهام

| المهمة | المسؤول | Atomic Layer |
|--------|---------|-------------|
| `analyzeRequirements()` | Analyzer | Organism |
| `createAgents()` | AgentCreator | Organism |
| `createTasks()` | TaskCreator | Organism |
| `createWorkflows()` | WorkflowCreator | Organism |
| `optimizeSquad()` | Optimizer | Organism |
| `validateSquad()` | Validator | Organism |
| `createMultilingualReadme()` | ReadmeCreator | Organism |
| `deploySquad()` | المنسّق | Organism |
| `publishSquad()` | Publisher | Molecule |
| `manageState()` | المنسّق | Molecule |

## سير العمل

### squad_generation_pipeline
خط الأنابيب الرئيسي ذو 9 مرحلة — من تحليل المتطلبات إلى النشر.
```
[Analyzer] → [AgentCreator] → [TaskCreator] → [WorkflowCreator] → [Optimizer] → [Validator] → [ReadmeCreator] → Deploy → [Publisher]
```

### squad_publish_flow
مسار مستقل لنشر فريق موجود على squads.sh.
```
[Validator] → [Publisher]
```

## الإعدادات

- `config/coding-standards.md` — اصطلاحات التسمية، قواعد التنسيق، اللغة
- `config/tech-stack.md` — Node.js، AIOS Core، Claude Code، YAML/Markdown
- `config/source-tree.md` — هيكل مجلدات الفريق

## الاستخدام

### خط الأنابيب الكامل
```bash
/SQUADS:nsc:squad-analyzer
```

### الوكلاء الفرديون
```
/SQUADS:nsc:squad-analyzer          — تحليل المتطلبات
/SQUADS:nsc:squad-agent-creator     — توليد الوكلاء
/SQUADS:nsc:squad-task-creator      — توليد المهام
/SQUADS:nsc:squad-workflow-creator  — سير العمل وsquad.yaml
/SQUADS:nsc:squad-optimizer         — التحسين
/SQUADS:nsc:squad-validator         — التحقق
/SQUADS:nsc:squad-readme-creator    — README متعدد اللغات
/SQUADS:nsc:squad-publisher         — النشر
```

## المؤلف

**Luiz Gustavo Vieira Rodrigues** ([@gutomec](https://github.com/gutomec))

## الرخصة

MIT
