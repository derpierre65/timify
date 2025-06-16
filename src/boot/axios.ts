import { defineBoot } from '#q-app/wrappers';
import axios from 'axios';

export default defineBoot(() => {
  axios.defaults.baseURL = 'https://api.atlassian.com/ex/jira/';
});
