define([
    'knockout',
    'pages/characterizations/services/CharacterizationService',
    'text!./characterization-view-edit.html',
    './characterization-view-edit/characterization-design',
    './characterization-view-edit/characterization-executions',
    './characterization-view-edit/characterization-results',
    './characterization-view-edit/characterization-utils',
    'appConfig',
    'webapi/AuthAPI',
    'providers/Component',
    'utils/CommonUtils',
    'assets/ohdsi.util',
    'less!./characterization-view-edit.less',
    'components/tabs',
    'faceted-datatable',
], function (
    ko,
    CharacterizationService,
    view,
    characterizationDesign,
    characterizationExecutions,
    characterizationResults,
    characterizationUtils,
    config,
    authApi,
    Component,
    commonUtils,
    ohdsiUtil
) {
    class CharacterizationViewEdit extends Component {
        constructor(params) {
            super();

            this.params = params;

            this.selectTab = this.selectTab.bind(this);
            this.setupDesign = this.setupDesign.bind(this);
            this.setupSection = this.setupSection.bind(this);
            this.loadDesignData = this.loadDesignData.bind(this);

            this.designDirtyFlag = ko.observable({ isDirty: () => false });
            this.design = ko.observable({});

            this.loading = ko.observable(false);
            this.canSave = ko.computed(() => {
               return this.designDirtyFlag().isDirty();
            });
            this.canEdit = this.canDelete = ko.computed(function () {
                return true;
            });

            this.sectionList = ['design', 'executions', 'results', 'utils'];
            this.selectedTab = ko.observable();
            this.componentParams = ko.observable({
                characterizationId: params.characterizationId,
                design: this.design,
                executionId: this.params.subId,
            });

            params.characterizationId.subscribe(id => this.loadDesignData(id));
            this.loadDesignData(params.characterizationId());

            params.section.subscribe(value => this.setupSection(value));
            this.setupSection(params.section());
        }

        setupSection(section) {
            const tabIdx = this.sectionList.indexOf(section);
            if (tabIdx > -1) {
                this.selectedTab(tabIdx);
            } else {
                commonUtils.routeTo('/cc/characterizations/' + this.componentParams().characterizationId() + '/design');
            }
        }

        setupDesign(design) {
            this.design({
                ...design,
                name: ko.observable(design.name),
            });
            this.designDirtyFlag(new ohdsiUtil.dirtyFlag(this.design));
        }

        loadDesignData(id) {
            if (id < 1) {
                this.setupDesign({})
            } else {
                this.loading(true);
                CharacterizationService
                    .loadCharacterizationDesign(id)
                    .then(res => {
                        this.setupDesign(res);
                        this.loading(false);
                    });
            }
        }

        selectTab(index) {
            commonUtils.routeTo('/cc/characterizations/' + this.params.characterizationId() + '/' + this.sectionList[index]);
        }

        save() {
            const ccId = this.params.characterizationId();

            if (ccId < 1) {
                CharacterizationService
                    .createCharacterization(this.design())
                    .then(res => commonUtils.routeTo('/cc/characterizations/' + res.id + '/design'));
            } else {
                CharacterizationService
                    .updateCharacterization(ccId, this.design())
                    .then(res => {
                        this.setupDesign(res);
                        this.loading(false);
                    });
            }
        }

        deleteCc() {
            if (confirm('Are you sure?')) {
                this.loading(true);
                CharacterizationService
                    .deleteCharacterization(this.params.characterizationId())
                    .then(res => {
                        this.loading(false);
                        this.closeCharacterization();
                    });
            }
        }

        closeCharacterization() {
            commonUtils.routeTo('/cc/characterizations');
        }
    }

    return commonUtils.build('characterization-view-edit', CharacterizationViewEdit, view);
});