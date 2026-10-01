export type ApiFixtureEvent = {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string; // 'Goal' | 'Card' | 'subst' | 'Var'
  detail: string; // e.g. 'Normal Goal', 'Yellow Card', 'Red Card', 'Substitution 1'
};

export type ApiFixtureEventsResponse = {
  response: ApiFixtureEvent[];
};