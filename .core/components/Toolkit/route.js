import Toolkit from './index';
import deps from 'dependencies';

export default {
    path: '/toolkit',
    exact: true,
    component: Toolkit,
    load: (params, search) => deps.actions.Toolkit.mount(params, search),
};
