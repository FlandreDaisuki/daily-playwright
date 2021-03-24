const formatter = new Intl.DateTimeFormat('zh', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  hour12: false,
  timeZone: process.env.TZ
});

export const log = (...args) => console.log(
  `[${ formatter.format(new Date) }]`,
  ...args
)
