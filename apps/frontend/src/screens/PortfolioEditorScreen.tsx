import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { PROFESSIONS, SECTION_TYPES } from '../utils/constants';
import Button from '../components/Button';
import Input from '../components/Input';
import SkillBadge from '../components/SkillBadge';

const PortfolioEditorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createPortfolio, isLoading } = usePortfolioStore();

  const [title, setTitle] = useState('');
  const [profession, setProfession] = useState('');
  const [summary, setSummary] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<Array<{ name: string; level: string; category: string; years_experience: number }>>([]);
  const [sections, setSections] = useState<Array<{ id: string; type: string; title: string; description: string; order_index: number; content: unknown }>>([]);
  const [isPublic, setIsPublic] = useState(true);

  const addSkill = () => {
    if (skillInput.trim() && !skills.find(s => s.name.toLowerCase() === skillInput.toLowerCase())) {
      setSkills([...skills, { name: skillInput.trim(), level: 'intermediate', category: '', years_experience: 1 }]);
      setSkillInput('');
    }
  };

  const removeSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const addSection = (type: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
      title: '',
      description: '',
      order_index: sections.length,
      content: {},
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, field: string, value: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const portfolio = await createPortfolio({
        title, profession, summary, skills, sections,
        tags: skills.map(s => s.name),
        is_public: isPublic,
      });
      navigate(`/portfolio/${portfolio.id}`);
    } catch { /* error in store */ }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-brand-950 py-12" id="portfolio-editor">
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-slide-up mb-12 border-b border-surface-200 dark:border-brand-800 pb-6">
          <h1 className="text-3xl font-bold font-display text-brand-900 dark:text-brand-50 mb-2 tracking-tight">Create Portfolio</h1>
          <p className="text-surface-500 font-serif italic">Build your dynamic, profession-specific presentation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <div className="card p-8 animate-slide-up animate-delay-100" id="editor-basic">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-100 mb-8 pb-4 border-b border-surface-100 dark:border-brand-800 flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-brand-900 dark:bg-brand-50 flex items-center justify-center text-white dark:text-brand-900 font-bold text-xs">1</span>
              Basic Information
            </h2>

            <div className="space-y-6">
              <Input label="Portfolio Title" placeholder="e.g., Senior Full-Stack Developer" value={title} onChange={setTitle} id="editor-title" required />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-surface-600 dark:text-surface-300 mb-4">Profession</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PROFESSIONS.map((prof) => (
                    <button
                      key={prof.value}
                      type="button"
                      onClick={() => setProfession(prof.value)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded border transition-all duration-200 ${
                        profession === prof.value
                          ? 'border-brand-900 dark:border-brand-50 bg-brand-900 dark:bg-brand-50 text-white dark:text-brand-950'
                          : 'border-surface-200 dark:border-brand-800 bg-transparent text-surface-600 dark:text-surface-300 hover:border-brand-300 dark:hover:border-brand-700'
                      }`}
                    >
                      <prof.icon className="w-5 h-5" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-center">{prof.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-surface-600 dark:text-surface-300 mb-2">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief description of your expertise and what makes you unique..."
                  rows={4}
                  className="input-field resize-none bg-surface-50 dark:bg-brand-900 focus:bg-white dark:focus:bg-brand-950"
                  id="editor-summary"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPublic ? 'bg-brand-900 dark:bg-brand-50' : 'bg-surface-300 dark:bg-surface-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-brand-900 shadow transition-transform duration-300 ${isPublic ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-semibold uppercase tracking-widest text-surface-700 dark:text-surface-300">Public Portfolio</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-8 animate-slide-up animate-delay-200" id="editor-skills">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-100 mb-8 pb-4 border-b border-surface-100 dark:border-brand-800 flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-brand-900 dark:bg-brand-50 flex items-center justify-center text-white dark:text-brand-900 font-bold text-xs">2</span>
              Skills
            </h2>

            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Add a skill (e.g., React, Python, Figma)"
                value={skillInput}
                onChange={setSkillInput}
                className="flex-1"
                id="editor-skill-input"
              />
              <Button type="button" onClick={addSkill} variant="secondary" className="mt-7">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillBadge key={skill.name} name={skill.name} level={skill.level} removable onRemove={() => removeSkill(skill.name)} />
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-surface-400 font-serif italic">No skills added yet. Type a skill and click "Add".</p>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="card p-8 animate-slide-up animate-delay-300" id="editor-sections">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-100 mb-8 pb-4 border-b border-surface-100 dark:border-brand-800 flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-brand-900 dark:bg-brand-50 flex items-center justify-center text-white dark:text-brand-900 font-bold text-xs">3</span>
              Content Sections
            </h2>

            {/* Add Section Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => addSection(type.value)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded border border-dashed border-surface-300 dark:border-surface-600 text-xs font-semibold uppercase tracking-widest text-surface-600 dark:text-surface-300 hover:border-brand-900 dark:hover:border-brand-50 hover:text-brand-900 dark:hover:text-brand-50 transition-all duration-200"
                >
                  <type.icon className="w-4 h-4" /> {type.label}
                </button>
              ))}
            </div>

            {/* Section List */}
            <div className="space-y-6">
              {sections.map((section, i) => {
                const sectionType = SECTION_TYPES.find(t => t.value === section.type);
                return (
                  <div key={section.id} className="p-6 rounded bg-surface-50 dark:bg-brand-900/30 border border-surface-200 dark:border-brand-800 animate-scale-in">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-200 dark:border-brand-800/50">
                      <div className="flex items-center gap-3">
                        {sectionType && <sectionType.icon className="w-5 h-5 text-surface-500" />}
                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-100">{sectionType?.label} Section</span>
                        <span className="text-xs font-bold text-surface-400 dark:text-surface-500">#{i + 1}</span>
                      </div>
                      <button type="button" onClick={() => removeSection(section.id)} className="text-surface-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <Input placeholder="Section title" value={section.title} onChange={(v) => updateSection(section.id, 'title', v)} />
                      <textarea
                        placeholder="Section description or content..."
                        value={section.description}
                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                        rows={3}
                        className="input-field resize-none bg-white dark:bg-brand-950 focus:bg-white dark:focus:bg-brand-950"
                      />
                    </div>
                  </div>
                );
              })}
              {sections.length === 0 && (
                <div className="text-center py-12 border-dashed border-2 border-surface-200 dark:border-brand-800 rounded bg-transparent">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-surface-400" />
                  <p className="text-sm font-semibold uppercase tracking-widest text-surface-500">Click a section type above to add content to your portfolio</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 pt-6 animate-slide-up animate-delay-300">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="px-6 py-3">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!title || !profession} id="editor-publish" className="px-8 py-3">
              Publish Portfolio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioEditorScreen;
