const constructor = {
  chapters: [],
  steps: [],

  init() {
    if (localStorage.getItem('constructedNovel')) {
      const data = JSON.parse(localStorage.getItem('constructedNovel'));
      proceedNovelJSON(data);
    } else {
      fetch('stepsData.json')
      .then(response => response.json())
      .then(data => {
        proceedNovelJSON(data)
      })
      .catch(error => console.error("Error loading data:", error));
    };

    document.getElementById('additionalConditionRules').appendChild(constructor.renderConditionRule(true));

    function proceedNovelJSON(data) {
      constructor.chapters = data.chapters;
      constructor.steps = [...constructor.chapters.flatMap(ch => ch.steps)];

      constructor.updateStepsSelects();
      constructor.updateChaptersSelects();

      console.log(data);

      constructor.renderChaptersList(data.chapters, document.getElementById('listOfChapters'));
    };

    document.getElementById('downloadJsonBtn').onclick = () => {
      const data = {
        chapters: this.chapters,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);


      const downloadLink = document.createElement('a');
      downloadLink.download = 'stepsData.json';
      downloadLink.href = url;
      downloadLink.click();

      URL.revokeObjectURL(url);
    };

    document.getElementById('addChoiceBtn').onclick = () => {
      const choiceForm = document.getElementById('createChoiceForm');
      choiceForm.classList.remove('d-none');
      document.getElementById('addChoiceBtn').classList.add('d-none');
    };

    document.getElementById('chapterTitle').addEventListener('input', function(e) {
      document.getElementById('createChapterBtn').disabled = e.target.value === '';
    });

    document.getElementById('openChapterEditorBtn').addEventListener('click', function(e) {
      document.getElementById('createChapterBtn').removeAttribute('data-id');
      document.getElementById('chapterTitle').value = '';
      document.getElementById('createChapterModalLabel').textContent = 'Create Chapter';
      document.getElementById('createChapterBtn').disabled = true
    });

    document.getElementById('nextStepConditionsList').addEventListener('click', function(e) {
      const conditionsList = document.getElementById('nextStepConditionsList');

      if(e.target.classList.contains('js-remove-UIcondition')) {
        const confirmRemoval = confirm('Are you sure you want to remove this condition?');
        if(confirmRemoval) {
          e.target.closest('.js-UIcondition').remove();

          if(conditionsList.querySelectorAll('.js-UIcondition').length === 0) {
            conditionsList.classList.add('d-none');
          };
        };
      };
    });

    document.getElementById('createChapterBtn').onclick = () => {
      const title = document.getElementById('chapterTitle').value;
      const chapterId = document.getElementById('createChapterBtn').getAttribute('data-id');

      const data = {
        id: chapterId ? chapterId : 'chapter' + Date.now(),
        title: title,
      };

      if(chapterId) {
        const chapter = constructor.chapters.find(ch => ch.id === chapterId);
        data.steps = chapter.steps;

        constructor.chapters = constructor.chapters.filter(ch => ch.id !== chapterId);
      } else {
        data.steps = [];
      };

      constructor.chapters.push(data);

      const listOfChapters = document.getElementById('listOfChapters');
      listOfChapters.innerHTML = '';

      document.getElementById('chapterTitle').value = '';

      proceedNovelJSON({ chapters: constructor.chapters });

      this.saveNovelToLocalStorage();
    };

    document.getElementById('cancelChoiceBtn').onclick = () => {
      const choiceForm = document.getElementById('createChoiceForm');
      choiceForm.classList.add('d-none');
      document.getElementById('addChoiceBtn').classList.remove('d-none');
      document.getElementById('choiceText').value = '';
      document.getElementById('choiceValue').value = '';

      const statsContainer = document.getElementById('statsContainer');
      statsContainer.innerHTML = '';

      const statForm = this.createStatForm(0, '', '');
      statsContainer.appendChild(statForm);
    };

    document.getElementById('addStatBtn').onclick = () => {
      const statsContainer = document.getElementById('statsContainer');
      const index = statsContainer.children.length;
      statsContainer.appendChild(this.createStatForm(index, '', ''));
    };

    document.getElementById('statsContainer').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-stat')) {
        e.target.closest('.stats-item').remove();
      };
    });

    document.getElementById('additionalConditionRules').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-conditionRule')) {
        e.target.closest('.js-condition-rule').remove();
      };
    });

    document.getElementById('listOfChapters').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-chapter')) {
        const chapterId = e.target.closest('.chapter-box').querySelector('.chapter-title').getAttribute('data-id');

        const confirmRemoval = confirm(`Are you sure you want to remove chapter: ${e.target.closest('.chapter-box').querySelector('.chapter-title span').textContent}?`);
        if (confirmRemoval) {
          constructor.chapters = constructor.chapters.filter(chapter => chapter.id !== chapterId);

          constructor.saveNovelToLocalStorage();
          document.getElementById('listOfChapters').innerHTML = '';

          proceedNovelJSON({ chapters: constructor.chapters });
        };
      };
    });

    document.getElementById('listOfChapters').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-edit-chapter')) {
        const chapterId = e.target.closest('.chapter-box').querySelector('.chapter-title').getAttribute('data-id');
        const chapterData = constructor.chapters.find(chapter => chapter.id === chapterId);
        document.getElementById('createChapterModalLabel').textContent = 'Edit chapter: ' + chapterData.title;
        document.getElementById('chapterTitle').value = chapterData.title;

        document.getElementById('createChapterBtn').textContent = 'Save';
        document.getElementById('createChapterBtn').setAttribute('data-id', chapterId);
        document.getElementById('createChapterBtn').disabled = false;
      };
    });

    document.getElementById('nextStepConditionsList').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-condition')) {
        e.target.closest('.js-next-stepCondition').remove();
      };
    });

    document.querySelectorAll('.form-check-input[name="nextStep"]').forEach(input => {
      input.addEventListener('change', () => {
        document.querySelectorAll('.suboption').forEach(suboption => {
          suboption.classList.add('d-none');
        });
        document.querySelector(`.suboption[for="${input.id}"]`).classList.remove('d-none');
      });
    });

    document.getElementById('conditionConstructor').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-conditionStatChoiceOperator')) {
        console.log(e.target.closest('.js-condition-rule'))
        if (e.target.value === 'stat') {
          e.target.closest('.js-condition-rule').querySelector('.js-checkforStatBox').classList.remove('d-none');
          e.target.closest('.js-condition-rule').querySelector('.js-checkforChoiceBox').classList.add('d-none');
        } else {
          e.target.closest('.js-condition-rule').querySelector('.js-checkforStatBox').classList.add('d-none');
          e.target.closest('.js-condition-rule').querySelector('.js-checkforChoiceBox').classList.remove('d-none');
        };
      };
    });

    document.getElementById('addNextConditionRuleBtn').onclick = () => {
      const rulesContainer = document.getElementById('additionalConditionRules');
      rulesContainer.classList.remove('d-none');
      rulesContainer.appendChild(constructor.renderConditionRule(false));
    };

    document.getElementById('saveNextStepConditionBtn').onclick = () => {
      const conditionsContainer = document.getElementById('nextStepConditionsList');
      conditionsContainer.classList.remove('d-none');
      conditionsContainer.appendChild(constructor.renderConditionSetup());

      const rulesContainer = document.getElementById('additionalConditionRules');
      rulesContainer.innerHTML = '';
      rulesContainer.appendChild(constructor.renderConditionRule(true));
      document.getElementById('nextStepId_conditionReturn').value = constructor.steps[0].id;
    };
  },

  createChapterElement(index, title, id) {
    const chapterElement = document.createElement('h5');
    chapterElement.className = 'chapter-title d-flex align-items-center justify-content-between m-0';
    chapterElement.setAttribute('data-id', id);
    chapterElement.append(document.createElement('span'));

    chapterElement.querySelector('span').textContent = title;

    const controls = `
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm js-edit-chapter" type="button" data-bs-toggle="modal" data-bs-target="#createChapterModal">Edit</button>
        <button class="btn btn-outline-danger btn-sm js-remove-chapter" type="button">Remove</button>
      </div>
    `;

    chapterElement.innerHTML += controls;
    return chapterElement;
  },

  updateStepsSelects() {
    document.querySelectorAll('.js-next-stepID-list').forEach(list => {
      list.innerHTML = '';
      constructor.steps.forEach(step => {
        const option = document.createElement('option');
        option.value = step.id;
        option.text = step.name;
        list.add(option);
      });
    });
  },

  updateChaptersSelects() {
    document.querySelectorAll('.js-chaptersID-List').forEach(list => {
      list.innerHTML = '';
      constructor.chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter.id;
        option.text = chapter.title;
        list.add(option);
      });
    });
  },

  renderChaptersList(data, chaptersContainer) {
    data.forEach((chapter, index) => {
      const chapterBox = document.createElement('div');
      chapterBox.className = 'card p-3 chapter-box';
      chaptersContainer.appendChild(chapterBox);
      const parentChapterTitle = chapter.title;
      chapterBox.appendChild(this.createChapterElement(index, parentChapterTitle, chapter.id));

      
      
      const steps = chapter.steps;
      if (steps.length) {
        const list = document.createElement('ul');
        list.className = 'list-group list-group-flush mt-2';
        chapterBox.appendChild(list);
        
        steps.forEach(step => {
          const option = document.createElement('li');
          option.className = 'list-group-item m-0';
          option.setAttribute('data-id', step.id);
          option.textContent = step.name;
          list.appendChild(option);
          chapterBox.appendChild(list);
        });
      };
    });
  },

  renderConditionRule(isFirstRule) {
    const rule = document.createElement('div');
    rule.className = 'js-condition-rule';

    rule.innerHTML = `
      ${isFirstRule ? '' : `
        <select name="nextRuleOperator" class="form-select flex-shrink-1 mb-3 js-additionalRuleOperator">
          <option value="and" selected>And</option>
          <option value="or">Or</option>
        </select>
      `}

      <div class="bg-body-secondary card p-3">

        <div class="d-flex align-items-center gap-2 mb-3">
          <span>IF</span>

          <select name="statChoiceOperator" class="form-select flex-shrink-1 js-conditionStatChoiceOperator">
            <option value="stat" selected>Stat</option>
            <option value="choice">Choice</option>
          </select>
        </div>

        <!-- Stat -->
        <div class="d-flex align-items-center gap-2 js-checkforStatBox">
          <span>IS</span>
          <input type="text" name="statName" class="form-control js-conditionStatName" placeholder="Stat name">
          <select name="statOperator" class="form-select flex-shrink-1 w-25 js-conditionStatOperator">
            <option value="equals">equals</option>
            <option value="notEquals">not equals</option>
            <option value="lessThan">less than</option>
            <option value="greaterThan">greater than</option>
            <option value="lessOrEquals">less or equals</option>
            <option value="greaterOrEquals">greater or equals</option>
          </select>
          <input type="number" name="statValue" class="form-control flex-shrink-1 w-25 js-conditionStatValue" placeholder="0">
        </div>

        <!-- Choice -->
        <div class="d-flex align-items-center gap-2 js-checkforChoiceBox d-none">
          <span class="flex-shrink-0">of the</span>
          <select class="form-select js-next-stepID-list js-conditionStepName" aria-label="Steps list"></select>
          <span class="flex-shrink-0">was</span>
          <select name="valueOperator" class="form-select w-25 flex-shrink-1 js-conditionValueOperator">
            <option value="equals">equals</option>
            <option value="notEquals">not equals</option>
          </select>
          <input type="text" name="choiceValue" class="form-control flex-shrink-1 js-conditionChoiceValue" placeholder="intellectual">
        </div>

        ${isFirstRule ? '' : `
          <div class="mt-3">
            <button class="btn btn-outline-danger btn-sm js-remove-conditionRule" type="button">Remove rule</button>
          </div>
        `}
          
      </div>
    `;

    const nextStepIdDirectSelect = document.getElementById('nextStepId_direct');
    const options = [...nextStepIdDirectSelect.options];
    const conditionStepNameSelect = rule.querySelector('.js-conditionStepName');

    options.forEach(option => {
      const optionCopy = document.createElement('option');
      optionCopy.value = option.value;
      optionCopy.text = option.text;
      conditionStepNameSelect.appendChild(optionCopy);
    });

    return rule;
  },

  renderConditionSetup() {
    const editorContainer = document.getElementById('additionalConditionRules');
    const conditionRules = editorContainer.querySelectorAll('.js-condition-rule');
    const condition = [];
    let conditionUI = '';

    conditionRules.forEach((rule, index) => {
      const operatorMap = {
        equals: '==',
        notEquals: '!=',
        lessThan: '<',
        greaterThan: '>',
        lessOrEquals: '<=',
        greaterOrEquals: '>=',
      };

      const operatorUIMap = {
        equals: 'equals',
        notEquals: 'not equals',
        lessThan: 'less than',
        greaterThan: 'greater than',
        lessOrEquals: 'less or equals',
        greaterOrEquals: 'greater or equals',
      };

      if(index !== 0) {
        const operator = rule.querySelector('.js-additionalRuleOperator').value;
        condition.push(operator === 'and' ? '&&' : '||');
        conditionUI += ', ' + operator + ' ';
      } else {
        conditionUI += 'If ';
      };

      const param = rule.querySelector('.js-conditionStatChoiceOperator').value; // stat/choice
      if (param === 'stat') {
        const statName = rule.querySelector('.js-conditionStatName').value;
        const operator = rule.querySelector('.js-conditionStatOperator').value;
        const value = rule.querySelector('.js-conditionStatValue').value;

        condition.push(`app.stats.${statName} ${operatorMap[operator]} ${value}`);

        conditionUI += `"${statName}" stat is ${operatorUIMap[operator]} ${value}`;
      } else if (param === 'choice') {
        const stepId = rule.querySelector('.js-conditionStepName').value;
        const operator = rule.querySelector('.js-conditionValueOperator').value;
        const value = rule.querySelector('.js-conditionChoiceValue').value;

        condition.push(`app.logs.find(obj => obj.stepId === '${stepId}' && obj.value ${operatorMap[operator]} '${value}')`);
        conditionUI += `"${constructor.steps.find(step => step.id === stepId).name}" step was ${operatorUIMap[operator]} "${value}"`;
      };
    });

    const returnValue = document.getElementById('nextStepId_conditionReturn').value;
    const returnStepName = constructor.steps.find(step => step.id === returnValue).name;

    conditionUI += `, then go to "${returnStepName}" step.`;

    const conditionData = { 
      conditionsUIString: conditionUI,
      conditionString: `(${condition.join(' ')}) { return '${returnValue}'; }`, 
      conditionArray: condition,
      returnValue: {
        stepId: returnValue, 
        stepName: returnStepName
      } 
    };

    console.log(conditionData);

    const UIElement = document.createElement('div');
    UIElement.className = 'border-bottom border-top py-3 d-flex flex-column justify-content-between gap-2 flex-lg-row align-items-start js-UIcondition';
    UIElement.appendChild(document.createElement('span'));
    UIElement.querySelector('span').textContent = conditionUI;

    UIElement.insertAdjacentHTML('beforeend', `
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm js-edit-UIcondition" type="button" data-bs-toggle="modal" data-bs-target="#createConditionModal">Edit</button>
        <button class="btn btn-outline-danger btn-sm js-remove-UIcondition" type="button">Remove</button>
      </div>
    `);

    UIElement.setAttribute('data-condition', JSON.stringify(conditionData));

    return UIElement;
  },

  createStatForm(index, stat, value) {
    const statItem = document.createElement('div');
    statItem.className = 'd-flex gap-2 stats-item';
    statItem.innerHTML = `
      <input type="text" class="form-control" id="statItem_${index}" placeholder="Stat name" value="${stat}">
      <input type="number" class="form-control w-25" id="statValue_${index}" placeholder="Stat value" value="${value}">
      <button class="btn btn-outline-danger js-remove-stat" type="button">Remove</button>
    `;
    
    return statItem;
  },

  createNextStepConditionForm() {
    const selectsList = document.getElementById('nextStepId_direct');

    const nextStepCondition = document.createElement('div');
    nextStepCondition.className = 'd-flex gap-2 align-items-center js-next-stepCondition';
    nextStepCondition.innerHTML = `
      <span>If</span>
      <input type="text" name="statName" class="form-control" id="" placeholder="Stat name">
      <select name="statOperator" class="form-select flex-shrink-1" id="">
        <option value="equals">equals</option>
        <option value="notEquals">not equals</option>
        <option value="lessThan">less than</option>
        <option value="greaterThan">greater than</option>
        <option value="lessOrEquals">less or equals</option>
        <option value="greaterOrEquals">greater or equals</option>
      </select>
      <input type="number" name="statValue" class="form-control flex-shrink-1 w-25" id="" placeholder="0">
      <span class="flex-shrink-0">then go to</span>
      <select class="form-select js-next-stepID-list" aria-label="Steps list">
        ${selectsList.innerHTML}
      </select>
      <button class="btn btn-outline-danger js-remove-condition" type="button">Remove</button>
    `;

    return nextStepCondition;
  },

  saveNovelToLocalStorage() {
    const jsonString = JSON.stringify({ chapters: this.chapters }, null, 2);
    localStorage.setItem('constructedNovel', jsonString);
  }
};

document.addEventListener('DOMContentLoaded', () => constructor.init());