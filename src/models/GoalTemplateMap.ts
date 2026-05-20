import { GoalTemplateCategoriesKindEnum, type GoalTemplate } from '@gs';
import { MoreTableChoice } from './MoreTableModel';

export interface GoalTemplateMap extends GoalTemplate {
  categoryKind?: GoalTemplateCategoriesKindEnum;
  categoryTopics?: string[];
  goalTypeLabel: string;
  adhearanceCheckLabels: string[];
  appTitle: string;
  observationGroupValues?: MoreTableChoice[];
}
