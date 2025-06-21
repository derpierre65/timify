import AbstractResource from 'src/lib/resources/AbstractResource';
import { type Project, useProjectStore } from 'stores/project';
import { rand } from 'src/lib/number';

export default class ProjectResource extends AbstractResource<Project> {
  public override getDefaultValues(): Project {
    const randomProjectColors = [
      '#b60205',
      '#d93f0b',
      '#fbca04',
      '#0e8a16',
      '#006b75',
      '#1d76db',
      '#5319e7',
    ];

    return {
      uid: null!,
      name: '',
      color: randomProjectColors[rand(0, randomProjectColors.length - 1)]!,
    };
  }

  override get piniaStore() {
    return useProjectStore();
  }
}
