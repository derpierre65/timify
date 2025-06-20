import { defineBoot } from '#q-app/wrappers';
import ProjectResource from 'src/lib/resources/ProjectResource';
import { useProjectStore } from 'stores/project';

export default defineBoot(async() => {
  // load projects
  try {
    const { data, } = await ProjectResource.instance.index();
    useProjectStore().projects = data;
  }
  catch (error) {
    console.error('Fail to load projects.', error);
  }
});
