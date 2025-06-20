import AbstractResource from 'src/lib/resources/AbstractResource';
import { type Project, useProjectStore } from 'stores/project';

export default class ProjectResource extends AbstractResource<Project> {
  public override getDefaultValues(): Project {
    return {
      uid: null!,
      name: '',
      color: '',
    };
  }

  override get piniaStore() {
    return useProjectStore();
  }
}
