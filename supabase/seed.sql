insert into public.topics (slug, name, subtopics, related, sort) values
  ('world', 'World News', '{Middle East,Europe,Asia,Africa,Americas,South Asia}', '{politics,economy}', 1),
  ('politics', 'Politics', '{Elections,Policy,Diplomacy,Government}', '{world,economy}', 2),
  ('business', 'Business', '{Markets,Startups,Companies,Banking}', '{economy,technology}', 3),
  ('economy', 'Economy', '{Inflation,Jobs,Trade,Central Banks}', '{business,politics}', 4),
  ('technology', 'Technology', '{Artificial Intelligence,Smartphones,Cybersecurity,Social Media,Gadgets}', '{science,business}', 5),
  ('science', 'Science', '{Space,Physics,Biology,Research}', '{technology,health,environment}', 6),
  ('health', 'Health', '{Medicine,Fitness,Mental Health,Public Health}', '{science}', 7),
  ('environment', 'Climate & Environment', '{Climate Change,Energy,Wildlife,Pollution}', '{science,world}', 8),
  ('sports', 'Sports', '{Cricket,Football,Tennis,Formula 1,Basketball}', '{entertainment}', 9),
  ('entertainment', 'Entertainment', '{Movies,Music,TV,Celebrities,Gaming}', '{culture,sports}', 10),
  ('culture', 'Arts & Culture', '{Books,Art,Food,Travel}', '{entertainment}', 11),
  ('education', 'Education', '{Universities,Schools,EdTech}', '{technology,politics}', 12)
on conflict (slug) do update set name = excluded.name, subtopics = excluded.subtopics,
  related = excluded.related, sort = excluded.sort;
