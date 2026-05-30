import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen mesh-bg py-10" id="portfolio-editor">
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold font-display text-surface-900 mb-2">Create Portfolio</h1>
          <p className="text-surface-500 mb-8">Build your dynamic, profession-specific presentation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="glass-card p-8 animate-slide-up animate-delay-100" id="editor-basic">
            <h2 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">1</span>
              Basic Information
            </h2>

            <div className="space-y-5">
              <Input label="Portfolio Title" placeholder="e.g., Senior Full-Stack Developer" value={title} onChange={setTitle} id="editor-title" required />

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Profession</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROFESSIONS.map((prof) => (
                    <button
                      key={prof.value}
                      type="button"
                      onClick={() => setProfession(prof.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm ${
                        profession === prof.value
                          ? 'border-brand-500 bg-brand-50 shadow-brand'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <span>{prof.icon}</span>
                      <span className="font-medium text-surface-700">{prof.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief description of your expertise and what makes you unique..."
                  rows={4}
                  className="input-field resize-none"
                  id="editor-summary"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-brand-500' : 'bg-surface-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-surface-700">Public portfolio</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-8 animate-slide-up animate-delay-200" id="editor-skills">
            <h2 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">2</span>
              Skills
            </h2>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a skill (e.g., React, Python, Figma)"
                value={skillInput}
                onChange={setSkillInput}
                className="flex-1"
                id="editor-skill-input"
              />
              <Button type="button" onClick={addSkill} variant="secondary" size="sm">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillBadge key={skill.name} name={skill.name} level={skill.level} removable onRemove={() => removeSkill(skill.name)} />
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-surface-400 italic">No skills added yet. Type a skill and click "Add".</p>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="glass-card p-8 animate-slide-up animate-delay-300" id="editor-sections">
            <h2 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">3</span>
              Content Sections
            </h2>

            {/* Add Section Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => addSection(type.value)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-surface-300 text-sm text-surface-600 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  <span>{type.icon}</span> {type.label}
                </button>
              ))}
            </div>

            {/* Section List */}
            <div className="space-y-4">
              {sections.map((section, i) => {
                const sectionType = SECTION_TYPES.find(t => t.value === section.type);
                return (
                  <div key={section.id} className="p-5 rounded-xl bg-surface-50 border border-surface-200 animate-scale-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sectionType?.icon}</span>
                        <span className="text-sm font-medium text-surface-500">{sectionType?.label} Section</span>
                        <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded">#{i + 1}</span>
                      </div>
                      <button type="button" onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Input placeholder="Section title" value={section.title} onChange={(v) => updateSection(section.id, 'title', v)} />
                      <textarea
                        placeholder="Section description or content..."
                        value={section.description}
                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                        rows={3}
                        className="input-field resize-none"
                      />
                    </div>
                  </div>
                );
              })}
              {sections.length === 0 && (
                <div className="text-center py-10 text-surface-400">
                  <p className="text-4xl mb-3">📝</p>
                  <p className="text-sm">Click a section type above to add content to your portfolio</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 animate-slide-up animate-delay-300">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!title || !profession} id="editor-publish">
              Publish Portfolio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioEditorScreen;
