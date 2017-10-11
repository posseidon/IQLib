'use strict';

module.context.use('/surveyarea', require('./routes/surveyarea'), 'surveyarea');
module.context.use('/dataset', require('./routes/dataset'), 'dataset');
module.context.use('/datafile', require('./routes/datafile'), 'datafile');
module.context.use('/contains', require('./routes/contains'), 'contains');
module.context.use('/produces', require('./routes/produces'), 'produces');
