import { createId } from '../utils/id.js'
import { daysFromToday } from '../utils/dates.js'

// Builds the demo workspace shown on first load (and after "Reset demo").
// Due dates are relative to *today*, so the demo always has a realistic mix
// of overdue, due-soon and future tasks no matter when someone opens it.

function task(title, { description = '', priority = 'med', due = null, labels = [], checklist = [] } = {}) {
  return {
    id: createId('task'),
    title,
    description,
    priority,
    dueDate: due === null ? null : daysFromToday(due),
    labels,
    checklist: checklist.map(([text, done]) => ({ id: createId('check'), text, done })),
    createdAt: Date.now(),
  }
}

/**
 * Turns a friendly nested description of boards into the normalized shape
 * the reducer works with: { boards, columns, tasks } keyed by id.
 */
function buildState(boardSpecs) {
  const state = { boards: {}, columns: {}, tasks: {}, boardOrder: [], activeBoardId: null }

  for (const spec of boardSpecs) {
    const boardId = createId('board')
    const columnIds = spec.columns.map(([title, tasks]) => {
      const columnId = createId('col')
      tasks.forEach((t) => (state.tasks[t.id] = t))
      state.columns[columnId] = { id: columnId, title, taskIds: tasks.map((t) => t.id) }
      return columnId
    })
    state.boards[boardId] = { id: boardId, name: spec.name, color: spec.color, columnIds }
    state.boardOrder.push(boardId)
  }

  state.activeBoardId = state.boardOrder[0]
  return state
}

export function createDemoState() {
  return buildState([
    {
      name: 'Website Launch',
      color: 'teal',
      columns: [
        [
          'Backlog',
          [
            task('Write launch blog post', {
              description: 'Announce the redesign: why we did it, what changed, and a short tour of the new pricing page.',
              priority: 'low',
              due: 9,
              labels: ['content', 'marketing'],
            }),
            task('Set up product analytics events', {
              description: 'Track sign-up funnel steps and pricing toggle usage.',
              priority: 'med',
              labels: ['dev', 'analytics'],
              checklist: [
                ['Define event names', true],
                ['Add tracking to sign-up flow', false],
                ['Build funnel dashboard', false],
              ],
            }),
            task('Collect customer testimonials', {
              priority: 'low',
              due: 14,
              labels: ['marketing'],
            }),
          ],
        ],
        [
          'To do',
          [
            task('Fix mobile nav overflow on Safari', {
              description: 'The menu sheet scrolls the page behind it on iOS 17. Likely needs `overscroll-behavior: contain`.',
              priority: 'high',
              due: -2,
              labels: ['bug', 'dev'],
            }),
            task('Accessibility audit', {
              description: 'Run axe + manual keyboard pass on every page before launch.',
              priority: 'high',
              due: 3,
              labels: ['a11y', 'qa'],
              checklist: [
                ['Color contrast', true],
                ['Keyboard navigation', false],
                ['Screen reader labels', false],
                ['Focus states', false],
              ],
            }),
            task('Compress hero images', {
              priority: 'med',
              due: 5,
              labels: ['performance'],
            }),
          ],
        ],
        [
          'In progress',
          [
            task('Build new pricing page', {
              description: 'Monthly / yearly toggle, three tiers, FAQ accordion. Design is final in Figma.',
              priority: 'high',
              due: 1,
              labels: ['dev', 'design'],
              checklist: [
                ['Tier cards', true],
                ['Billing toggle', true],
                ['FAQ accordion', true],
                ['Responsive pass', false],
                ['Connect checkout links', false],
              ],
            }),
            task('Design system: button variants', {
              description: 'Primary, secondary, ghost and destructive. Include loading state.',
              priority: 'med',
              due: 0,
              labels: ['design'],
              checklist: [
                ['Light theme', true],
                ['Dark theme', false],
              ],
            }),
          ],
        ],
        ['Review', [
          task('SEO meta tags & Open Graph images', {
            priority: 'med',
            due: -1,
            labels: ['dev', 'marketing'],
            checklist: [
              ['Titles + descriptions', true],
              ['OG images', true],
              ['Sitemap', true],
            ],
          }),
        ]],
        [
          'Done',
          [
            task('Choose hosting provider', { priority: 'low', labels: ['dev'] }),
            task('Finalize brand colors', {
              priority: 'med',
              labels: ['design'],
              checklist: [
                ['Palette', true],
                ['Contrast check', true],
              ],
            }),
          ],
        ],
      ],
    },
    {
      name: 'Personal',
      color: 'violet',
      columns: [
        ['Ideas', [task('Learn TypeScript basics', { priority: 'low', labels: ['learning'] })]],
        [
          'This week',
          [
            task('Update portfolio README files', {
              priority: 'high',
              due: 2,
              labels: ['career'],
              checklist: [
                ['Screenshots', false],
                ['What I learned section', false],
              ],
            }),
            task('Grocery run', { priority: 'med', due: 0, labels: ['home'] }),
          ],
        ],
        ['Done', []],
      ],
    },
  ])
}
