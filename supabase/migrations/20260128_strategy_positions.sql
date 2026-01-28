-- Strategy folder positions
-- Additional positions for operations and facilities management

INSERT INTO positions (name, name_uz, name_ru, description, level) VALUES
  -- Operations positions
  ('Assistant Operations Manager', 'Operatsiyalar bo''yicha yordamchi menejer', 'Помощник операционного менеджера', 'Assists in managing daily operations', 'Middle'),
  ('Supervisor', 'Nazoratchi', 'Супервайзер', 'Team supervisor overseeing daily activities', 'Middle'),

  -- Facilities/Technical positions
  ('Construction Control Specialist', 'Qurilish nazorati mutaxassisi', 'Специалист по контролю строительства', 'Oversees construction and renovation projects', 'Specialist'),
  ('Maintenance Specialist', 'Texnik xizmat mutaxassisi', 'Специалист по техническому обслуживанию', 'Handles facility maintenance and repairs', 'Specialist'),
  ('Facility Management Specialist', 'Obyekt boshqaruvi mutaxassisi', 'Специалист по управлению объектами', 'Manages facility operations and infrastructure', 'Specialist')

ON CONFLICT (name) DO UPDATE SET
  name_uz = EXCLUDED.name_uz,
  name_ru = EXCLUDED.name_ru,
  description = EXCLUDED.description,
  level = EXCLUDED.level;
