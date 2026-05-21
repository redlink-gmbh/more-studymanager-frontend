import { GoalTemplateCategoriesKindEnum, type GoalTemplate } from '@gs';
import { MoreTableChoice } from './MoreTableModel';

export interface GoalTemplateMap extends GoalTemplate {
  categoryKind?: GoalTemplateCategoriesKindEnum;
  categoryTopics?: string[];
  goalTypeLabel: string;
  adheranceCheckLabels: MoreTableChoice[];
  appTitle: string;
  observationGroupValues?: MoreTableChoice[];
}
