define(
  (require, factory) => {
    function routes(appModel, router) {
      const { AuthorizedRoute } = require('providers/Route');
      return {        
        '/plp': new AuthorizedRoute(() => {
          appModel.activePage(this.title);
          require([
            './plp-browser',
            // 'plp-manager',
            // 'plp-inspector'
          ], function () {
            router.setCurrentView('plp-browser');
          });
        }),
        '/plp/:modelId:': new AuthorizedRoute((modelId) => {
          appModel.activePage(this.title);
          require([
            './plp-manager',
            './components/plp-inspector',
            './components/plp-roc',
            './components/plp-calibration',
            './components/plp-spec-editor',
            './components/plp-r-code',
            './components/plp-print-friendly',
            'components/cohort-definition-browser',
            'components/atlas.cohort-editor'
          ], function () {
            appModel.currentPatientLevelPredictionId(+modelId);
            router.setCurrentView('plp-manager', {
              currentPatientLevelPredictionId: appModel.currentPatientLevelPredictionId,
              currentPatientLevelPrediction: appModel.currentPatientLevelPrediction,
              dirtyFlag: appModel.currentPatientLevelPredictionDirtyFlag,
            });
          });
        }),
      };
    }

    return routes;
  }
);