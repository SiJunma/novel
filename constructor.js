const constructor = {
  chapters: [],
  steps: [],

  init() {
    if (localStorage.getItem('constructedNovel')) {
      const data = JSON.parse(localStorage.getItem('constructedNovel'));
      constructor.proceedNovelJSON(data);
    } else {
      fetch('stepsData.json')
      .then(response => response.json())
      .then(data => {
        constructor.proceedNovelJSON(data)
      })
      .catch(error => console.error("Error loading data:", error));
    };

    const StepModalBtn = document.getElementById('openStepEditorBtn');
    const StepModal = new bootstrap.Modal(document.getElementById('createStepModal'));

    const ConditionModalBtn = document.getElementById('openConditionModalBtn');
    const ConditionModal = new bootstrap.Modal(document.getElementById('createConditionModal'));

    StepModalBtn.addEventListener('click', function(e) {
      StepModal.show();
    });

    ConditionModalBtn.addEventListener('click', function(e) {
      document.getElementById('createStepModal').classList.add('d-none');
      ConditionModal.show();
    });

    document.getElementById('createConditionModal').addEventListener('hidden.bs.modal', function(e) {
      document.getElementById('createStepModal').classList.remove('d-none');
    });

    document.getElementById('additionalConditionRules').appendChild(constructor.renderConditionRule(true));

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
            document.getElementById('saveChoiceBtn').disabled = true;
          };
        };
      };
    });

    //resetLocalsorageBtn
    document.getElementById('resetLocalsorageBtn').onclick = () => {
      const confirmReset = confirm('Are you sure you want to reset all data?');
      if(confirmReset) {
        localStorage.removeItem('constructedNovel');
        location.reload();
      };
    };

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

      document.getElementById('chapterTitle').value = '';

      this.saveNovelToLocalStorage();
    };

    document.getElementById('cancelChoiceBtn').onclick = () => {
      const choiceForm = document.getElementById('createChoiceForm');
      choiceForm.classList.add('d-none');
      document.getElementById('addChoiceBtn').classList.remove('d-none');
    };

    document.getElementById('addStatBtn').onclick = () => {
      const statsContainer = document.getElementById('statsContainer');
      const index = statsContainer.children.length;
      statsContainer.appendChild(this.createStatForm(index, '', ''));
      document.getElementById('saveChoiceBtn').disabled = true;
    };

    document.getElementById('statsContainer').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-stat')) {
        e.target.closest('.stats-item').remove();
        document.getElementById('saveChoiceBtn').disabled = !constructor.validateChoiceForm();
      };
    });

    document.getElementById('additionalConditionRules').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-conditionRule')) {
        e.target.closest('.js-condition-rule').remove();

        document.getElementById('saveNextStepConditionBtn').disabled = !constructor.validateConditionForm();
      };
    });

    document.getElementById('listOfChapters').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-chapter')) {
        const chapterId = e.target.closest('.chapter-box').querySelector('.chapter-title').getAttribute('data-id');

        const confirmRemoval = confirm(`Are you sure you want to remove chapter: ${e.target.closest('.chapter-box').querySelector('.chapter-title span').textContent}?`);
        if (confirmRemoval) {
          constructor.chapters = constructor.chapters.filter(chapter => chapter.id !== chapterId);

          constructor.saveNovelToLocalStorage();
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
        document.getElementById('saveChoiceBtn').disabled = !constructor.validateChoiceForm();;
      });
    });

    document.getElementById('addNextConditionRuleBtn').onclick = () => {
      const rulesContainer = document.getElementById('additionalConditionRules');
      rulesContainer.classList.remove('d-none');
      rulesContainer.appendChild(constructor.renderConditionRule(false));

      document.getElementById('saveNextStepConditionBtn').disabled = true;
    };

    document.getElementById('saveNextStepConditionBtn').onclick = () => {
      const conditionsContainer = document.getElementById('nextStepConditionsList');
      conditionsContainer.classList.remove('d-none');
      conditionsContainer.appendChild(constructor.renderConditionSetup());

      const rulesContainer = document.getElementById('additionalConditionRules');
      rulesContainer.innerHTML = '';
      rulesContainer.appendChild(constructor.renderConditionRule(true));
      document.getElementById('nextStepId_conditionReturn').value = constructor.steps[0].id;

      document.getElementById('saveChoiceBtn').disabled = !constructor.validateChoiceForm();
    };

    document.getElementById('saveChoiceBtn').onclick = () => {
      constructor.saveChoiceToStep();
      constructor.clearChoiceForm();
    };

    document.getElementById('createStepBtn').onclick = () => {
      constructor.savingStepToData();
    };

    //delete step from chapter's list
    document.getElementById('listOfChapters').addEventListener('click', (e) => {
      if (e.target.closest('.js-remove-listed-step')) {
        const stepName = e.target.closest('li.list-group-item').querySelector('span').textContent;

        const confirmation = confirm(`Are you sure you want to remove ${stepName} step?`);
        
        if (confirmation) {
          const stepId = e.target.closest('li.list-group-item').getAttribute('data-id');
          constructor.deleteStepFromData(stepId);
        };
      };
    });

    // Validation of create step form inputs
    document.querySelectorAll('.js-step-validation').forEach(input => {
      input.addEventListener('input', () => {
        document.getElementById('createStepBtn').disabled = !constructor.validateStepForm();
      });
    });

    // .js-remove-renderedChoice
    document.getElementById('choicesContainer').addEventListener('click', (e) => {
      if (e.target.closest('.js-remove-renderedChoice')) {
        const confirmation = confirm('Are you sure you want to remove this choice?');
        if (!confirmation) {
          return;
        };
        e.target.closest('.js-choiceItem').remove();
        const choicesContainer = document.getElementById('choicesContainer');

        if (choicesContainer.querySelectorAll('.js-choiceItem').length === 0) {
          choicesContainer.classList.add('d-none');
        };
      };
    });

    // .js-choice-validation of #createChoiceForm
    document.querySelectorAll('.js-choice-validation').forEach(input => {
      input.addEventListener('input', () => {
        document.getElementById('saveChoiceBtn').disabled = !constructor.validateChoiceForm();
      });
    });

    // Clear Choice form
    document.getElementById('resetChoiceBtn').onclick = () => {
      constructor.clearChoiceForm();
    };
  },

  saveChoiceToStep() {
    const choiceText = document.getElementById('choiceText').value;
    const choiceValue = document.getElementById('choiceValue').value;

    const stats = {};
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.querySelectorAll('.stats-item').forEach(item => {
      const statName = item.querySelector('.js-statName').value;
      const statValue = item.querySelector('.js-statValue').value;
      stats[statName] = statValue;
    });

    let nextStepId;
    let nextStepUI = '';

    if (document.getElementById('nextStep_id').checked) {
      nextStepId = document.getElementById('nextStepId_direct').value;
      nextStepUI = constructor.steps.find(step => step.id === nextStepId).name;
    } else if (document.getElementById('nextStep_condition').checked) {
      const conditionsList = document.getElementById('nextStepConditionsList');
      // "() => { if(app.stats.intellectual > 1) { return 'chapter2_step1'; } else if (app.logs.find(obj => obj.stepId === 'chapter1_step1' && obj.value === 'intellectual')) { return 'chapter1_step1'; } else { return 'chapter1_step4'; }; }"
      nextStepId = '() => {';

      conditionsList.querySelectorAll('.js-UIcondition').forEach((rule, index) => {
        const data = JSON.parse(rule.getAttribute('data-condition'));
        const functionString = data.conditionString;
        if (index === 0) {
          nextStepId += ` if`;
        } else {
          nextStepId += ` else if`;
        };

        nextStepId += functionString;

        nextStepUI += data.conditionsUIString + '/n'
      });

      nextStepId += ` else { return '${document.getElementById('nextStepId_default').value}'; }; }`;
    };

    const choiceObject = {
      text: choiceText,
      value: choiceValue,
      nextStepId: nextStepId,
      stats: stats
    };

    const choicesContainer = document.getElementById('choicesContainer');
    const choiceElement = document.createElement('div');
    choiceElement.className = 'd-flex justify-content-between align-items-start bg-body-tertiary card flex-row p-3 js-choiceItem';
    choiceElement.setAttribute('data-choice', JSON.stringify(choiceObject));
    let statsText = '';
    for (let stat in stats) {
      statsText += `${stat}: ${stats[stat]}`;
      if (Object.keys(stats).indexOf(stat) !== Object.keys(stats).length - 1) {
        statsText += ', ';
      } else {
        statsText += '.';
      };
    };

    choiceElement.innerHTML = `
      <div class="">
        <b>Text of a choice:</b>
        <div class="mb-2">${choiceText}</div>

        <div class="mb-2"><b>Value of a choice:</b> <span>${choiceValue}</span></div>

        <div class="mb-2"><b>Stats:</b> <span>${statsText}</span></div>

        <div>
          <b>Next step:</b> 
          <span>${nextStepUI.replaceAll('/n', '<br>')}</span>
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm js-edit-renderedChoice" type="button" data-bs-toggle="modal" data-bs-target="#createChoiceModal">Edit</button>
        <button class="btn btn-outline-danger btn-sm js-remove-renderedChoice" type="button">Remove</button>
      </div>
    `;

    choicesContainer.appendChild(choiceElement);
    choicesContainer.classList.remove('d-none');

    document.getElementById('createChoiceForm').classList.add('d-none');
    document.getElementById('addChoiceBtn').classList.remove('d-none');

    document.getElementById('createStepBtn').disabled = !constructor.validateStepForm();
  },

  validateChoiceForm() {
    const choiceText = document.getElementById('choiceText').value;
    const choiceValue = document.getElementById('choiceValue').value;

    let statsPassed = true;
    // #statsContainer .js-statName
    document.querySelectorAll('#statsContainer .js-statName').forEach(input => {
      if (!input.value) {
        statsPassed = false;
      };
    });

    let statsValuePassed = true;
    // #statsContainer .js-statValue
    document.querySelectorAll('#statsContainer .js-statValue').forEach(input => {
      if (!input.value) {
        statsValuePassed = false;
      };
    });

    const nextStep_condition = document.getElementById('nextStep_condition').checked;
    const conditionList = document.getElementById('nextStepConditionsList');
    let isConditionPassed = false;

    if(nextStep_condition) {
      isConditionPassed = conditionList.querySelectorAll('.js-UIcondition').length
    } else {
      isConditionPassed = true
    };

    return choiceText && choiceValue && statsPassed && statsValuePassed && isConditionPassed;
  },

  clearChoiceForm() {
    document.getElementById('createChoiceForm').querySelectorAll('.js-choice-validation').forEach(input => {
      input.value = '';
    });

    // remove all stats in statsContainer but leave just one
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '';

    const statForm = this.createStatForm(0, '', '');
    statsContainer.appendChild(statForm);

    // check nextStep_id
    document.getElementById('nextStep_id').click();

    // select first option in nextStepId_direct
    document.getElementById('nextStepId_direct').value = document.getElementById('nextStepId_direct').querySelector('option').value;

    //clear all nextStepConditionsList and hide it
    document.getElementById('nextStepConditionsList').innerHTML = '';
    document.getElementById('nextStepConditionsList').classList.add('d-none');

    //select first option in nextStepId_default
    document.getElementById('nextStepId_default').value = document.getElementById('nextStepId_default').querySelector('option').value;

    // disable saveChoiceBtn
    document.getElementById('saveChoiceBtn').disabled = true;
  },

  deleteStepFromData(stepId){
    constructor.chapters.forEach(chapter => {
      chapter.steps = chapter.steps.filter(step => step.id !== stepId);
    });

    constructor.saveNovelToLocalStorage();
  },

  validateStepForm() {
    const stepName = document.getElementById('stepName').value;
    const stepText = document.getElementById('stepText').value;
    const isChoices = document.getElementById('choicesContainer').querySelectorAll('.js-choiceItem').length;

    if(stepName && stepText && isChoices) {
      return true;
    } else {
      return false;
    };
  },

  validateConditionForm() {
    const conditionRules = document.getElementById('additionalConditionRules');
    // check in each js-condition-rule if all inputs are filled

    let isConditionPassed = true;

    conditionRules.querySelectorAll('.js-condition-rule').forEach(rule => {
      const ifOperator = rule.querySelector('.js-conditionStatChoiceOperator').value;
      let isRulePassed = true;

      if(ifOperator === 'stat') {
        const statName = rule.querySelector('.js-conditionStatName').value;
        const statValue = rule.querySelector('.js-conditionStatValue').value;

        isRulePassed = statName && statValue;
      } else if(ifOperator === 'choice') {
        const choiceValue = rule.querySelector('.js-conditionChoiceValue').value;

        isRulePassed = choiceValue !== '';
      };

      if(!isRulePassed) {
        isConditionPassed = false;
      };
    });
    return isConditionPassed;
  },
  savingStepToData() {
    const stepTitle = document.getElementById('stepName').value;
    const parentChapter = document.getElementById('parentChapter').value;
    const steptext = document.getElementById('stepText').value;
    
    const choices = [];
    document.getElementById('choicesContainer').querySelectorAll('.js-choiceItem').forEach(choice => {
      choices.push(JSON.parse(choice.getAttribute('data-choice')));
    });

    const parentChapterObject = constructor.chapters.find(chapter => chapter.id === parentChapter);

    parentChapterObject.steps.push({
      name: stepTitle,
      text: steptext,
      choices: choices,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    });

    constructor.saveNovelToLocalStorage();

    // reset step form
    document.getElementById('stepName').value = '';
    document.getElementById('stepText').value = '';
    document.getElementById('choicesContainer').innerHTML = '';
    document.getElementById('parentChapter').value = document.getElementById('parentChapter').querySelector('option').value;

    document.getElementById('choicesContainer').innerHTML = ``;
    document.getElementById('choicesContainer').classList.add('d-none');
  },
  proceedNovelJSON(data) {
    constructor.chapters = data.chapters;
    constructor.steps = [...constructor.chapters.flatMap(ch => ch.steps)];

    constructor.updateStepsSelects();
    constructor.updateChaptersSelects();

    console.log(data);

    constructor.renderChaptersList(data.chapters, document.getElementById('listOfChapters'));
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
          option.className = 'list-group-item m-0 d-flex flex-column flex-sm-row justify-content-between align-items-start ps-0';
          option.setAttribute('data-id', step.id);

          constructor.renderStepElement(option, step);
          
          list.appendChild(option);
          chapterBox.appendChild(list);
        });
      };
    });
  },

  renderStepElement(li, step) {
    console.log(step);
    const accordion = document.createElement('div');
    accordion.className = 'accordion accordion-flush flex-grow-1';

    let choicesHtml = '';
    step.choices.forEach(choice => {
      //text, value stats({key:value}), nextStepId

      choicesHtml += `<div class="bg-body-secondary p-2">
        <div>
          <span class="fw-semibold">Text: </span>
          <span>${choice.text ? choice.text : 'N/A'}</span>
        </div>

        <div>
          <span class="fw-semibold">Value: </span>
          <span>${choice.value ? choice.value : '-'}</span>
        </div>

        <div>
          <span class="fw-semibold">Next Step: </span>
          <span>${choice.nextStepId ? constructor.steps.find(step => step.id === choice.nextStepId)?.name || renderNextStepIdFunc(choice.nextStepId).replaceAll('/n', '<br />') : '-'}</span>
        </div>

        <div>
          <span class="fw-semibold">Stats: </span>
          <span>${Object.keys(choice.stats).length ? Object.entries(choice.stats).map(([key, value]) => `${key}: ${value}`).join(', ') : '-'}</span>
        </div>
      </div>`;

      function renderNextStepIdFunc(nextStepId) {
        function getStepName(stepId) {
          console.log(stepId);
          return constructor.steps.find(step => step.id === stepId)?.name || 'N/A';
        };

        let text = nextStepId
        .replace("() => { if(", '/n - If ')
        .replaceAll(") { return ", `, then go to @id:`)
        .replaceAll("else if (", "/n - If ")
        .replaceAll("app.stats.", `stat @stat:`)

        .replaceAll("app.logs.find(obj => obj.stepId === '", `value of @id:`)

        .replaceAll(" && obj.value === '", ' was @value:')
        .replaceAll(" && obj.value == '", ' was @value:')
        .replaceAll(" && obj.value !== '", ' was not @value:')
        .replaceAll(" && obj.value != '", ' was not @value:')

        .replaceAll("!=", 'not equals ')
        .replaceAll(">=", 'greater or equals ')
        .replaceAll("<=", 'less or equals ')

        .replaceAll(">", 'greater than ')
        .replaceAll("<", 'less than ')
        .replaceAll("==", 'equals ')
        
        .replaceAll(" && ", ', and ')
        .replaceAll(" || ", ', or ')
        
        .replace("else { return ", '/n - If no condition is met go to @id:')
        .replace("; }; }", '')
        .replaceAll("; } ", ' ')
        .replaceAll("')", '')
        .replaceAll("'", '')

        text = text
        .replaceAll(/@stat:([^@ ]+)/g, (_, statName) => `"${statName}"`)
        .replaceAll(/@id:([^@ ]+)/g, (_, stepId) => `"${getStepName(stepId)}"`)
        .replaceAll(/@value:([^@ ]+)/g, (_, value) => `"${value}"`);

        return text;
      };
    });


    accordion.insertAdjacentHTML('beforeend', `
      <div class="accordion-item">
        <h2 class="accordion-header" id="flush-heading${step.id}">
          <button class="accordion-button collapsed py-2 ps-2" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${step.id}" aria-expanded="false" aria-controls="flush-collapse${step.id}">
            <span class="me-3">${step.name ? step.name : 'N/A'}</span>
          </button>
        </h2>
        <div id="flush-collapse${step.id}" class="accordion-collapse collapse" aria-labelledby="flush-heading${step.id}" data-bs-parent="#accordionFlushExample">
          <div class="accordion-body px-0">
            <h6>Text:</h6>
            <div>${step.text ? step.text : 'N/A'}</div>

            <h6 class="mt-3">Choices:</h6>
            <div class="d-flex flex-column gap-2">${step.choices ? choicesHtml : 'N/A'}</div>
          </div>
        </div>
      </div>
      `);

    li.appendChild(accordion);

    const controls = `
      <div class="d-flex opacity-btns ms-sm-4">
        <button class="btn btn-sm js-edit-listed-Step border-0 opacity-25" disabled type="button" data-bs-toggle="modal" data-bs-target="#createStepModal"><img src="edit-text.png" alt="Edit" width="18" height="18"></button>
        <button class="btn btn-sm js-remove-listed-step" type="button"><img src="trash.png" alt="Remove" width="18" height="18"></button>
      </div>
    `;

    li.innerHTML += controls;
    
    return;
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
          <input type="text" name="statName" class="form-control js-conditionStatName js-condition-validation" placeholder="Stat name">
          <select name="statOperator" class="form-select flex-shrink-1 w-25 js-conditionStatOperator">
            <option value="equals">equals</option>
            <option value="notEquals">not equals</option>
            <option value="lessThan">less than</option>
            <option value="greaterThan">greater than</option>
            <option value="lessOrEquals">less or equals</option>
            <option value="greaterOrEquals">greater or equals</option>
          </select>
          <input type="number" name="statValue" class="form-control flex-shrink-1 w-25 js-conditionStatValue js-condition-validation" placeholder="0">
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
          <input type="text" name="choiceValue" class="form-control flex-shrink-1 js-conditionChoiceValue js-condition-validation" placeholder="intellectual">
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

    rule.querySelector('.js-conditionStatChoiceOperator').onchange = () => {
      const thisValue = rule.querySelector('.js-conditionStatChoiceOperator').value;
      const statBox = rule.querySelector('.js-checkforStatBox');
      const choiceBox = rule.querySelector('.js-checkforChoiceBox');

      if (thisValue === 'stat') {
        statBox.classList.remove('d-none');
        choiceBox.classList.add('d-none');
      } else {
        statBox.classList.add('d-none');
        choiceBox.classList.remove('d-none');
      };

      document.getElementById('saveNextStepConditionBtn').disabled = !constructor.validateConditionForm();
    };

    rule.querySelectorAll('.js-condition-validation').forEach(input => {
      input.oninput = () => {
        document.getElementById('saveNextStepConditionBtn').disabled = !constructor.validateConditionForm();
      };
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

    const UIElement = document.createElement('div');
    UIElement.className = 'border-bottom border-top py-3 d-flex flex-column justify-content-between gap-2 flex-lg-row align-items-start js-UIcondition';
    UIElement.appendChild(document.createElement('span'));
    UIElement.querySelector('span').textContent = conditionUI;

    UIElement.insertAdjacentHTML('beforeend', `
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm js-edit-UIcondition opacity-25" disabled type="button" data-bs-toggle="modal" data-bs-target="#createConditionModal">Edit</button>
        <button class="btn btn-outline-danger btn-sm js-remove-UIcondition" type="button">Remove</button>
      </div>
    `);

    UIElement.setAttribute('data-condition', JSON.stringify(conditionData));

    return UIElement;
  },

  createStatForm(index, stat, value) {
    const statItem = document.createElement('div');
    statItem.className = 'd-flex gap-2 flex-wrap flex-md-nowrap p-2 bg-primary-subtle stats-item';
    statItem.innerHTML = `
      <input type="text" class="form-control js-statName js-choice-validation" id="statItem_${index}" placeholder="Stat name" value="${stat}">
      <input type="number" class="form-control w-auto js-statValue js-choice-validation" id="statValue_${index}" placeholder="Stat value" value="${value}">
      <button class="btn btn-outline-danger js-remove-stat" type="button">Remove</button>
    `;

    statItem.querySelectorAll('.js-choice-validation').forEach(input => {
      input.addEventListener('input', () => {
        document.getElementById('saveChoiceBtn').disabled = !constructor.validateChoiceForm();
      });
    });
    
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
    const listOfChapters = document.getElementById('listOfChapters');
    listOfChapters.innerHTML = '';
    constructor.proceedNovelJSON({ chapters: constructor.chapters });
    
    const jsonString = JSON.stringify({ chapters: this.chapters }, null, 2);
    localStorage.setItem('constructedNovel', jsonString);
  }
};

document.addEventListener('DOMContentLoaded', () => constructor.init());