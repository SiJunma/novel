const constructor = {
  init() {
    fetch('stepsData.json')
    .then(response => response.json())
    .then(data => {
      this.chapters = data.chapters;
      this.sideChapters = data.sideChapters;

      this.updateStepsSelects();

      console.log(this.chapters);
      console.log(this.sideChapters);

      this.renderChaptersList(this.chapters, document.getElementById('listOfChapters'));
      this.renderChaptersList(this.sideChapters, document.getElementById('listOfChapters'));
    })
    .catch(error => console.error("Error loading data:", error));

    document.getElementById('addChoiceBtn').onclick = () => {
      const choiceForm = document.getElementById('createChoiceForm');
      choiceForm.classList.remove('d-none');
      document.getElementById('addChoiceBtn').classList.add('d-none');
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

    document.getElementById('addNextStepConditionBtn_simple').onclick = () => {
      const nextStepConditionsList = document.getElementById('nextStepConditionsList');
      nextStepConditionsList.appendChild(this.createNextStepConditionForm());
    };

    document.getElementById('statsContainer').addEventListener('click', (e) => {
      if (e.target.classList.contains('js-remove-stat')) {
        e.target.closest('.stats-item').remove();
      }
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
      
  },

  createChapterElement(index, title, id) {
    const chapterElement = document.createElement('h6');
    chapterElement.className = 'chapter-title';
    chapterElement.setAttribute('data-id', id);
    chapterElement.textContent = index + 1 + ". " + title;
    return chapterElement;
  },

  updateStepsSelects() {
    this.steps = [...this.chapters.flatMap(ch => ch.steps), ...this.sideChapters.flatMap(ch => ch.steps)];

    document.querySelectorAll('.js-next-stepID-list').forEach(list => {
      list.innerHTML = '';
      this.steps.forEach(step => {
        const option = document.createElement('option');
        option.value = step.id;
        option.text = step.name;
        list.add(option);
      });
    });
  },

  renderChaptersList(data, chaptersContainer) {
    const chapterBox = document.createElement('div');
    chapterBox.className = 'chapter-box';
    chaptersContainer.appendChild(chapterBox);
    
    data.forEach((chapter, index) => {
      const parentChapterTitle = chapter.title;
      chapterBox.appendChild(this.createChapterElement(index, parentChapterTitle, chapter.id));

      const list = document.createElement('ul');
      list.className = 'list-group';
      chapterBox.appendChild(list);
      
      const steps = chapter.steps;
      steps.forEach(step => {
        const option = document.createElement('li');
        option.className = 'list-group-item';
        option.setAttribute('data-id', step.id);
        option.textContent = step.name;
        list.appendChild(option);
        chapterBox.appendChild(list);
      });
    });
  },

  createStatForm(index, stat, value) {
    // <div class="d-flex gap-2 stats-item">
    //   <input type="text" class="form-control" id="statItem_0" placeholder="Stat name">
    //   <input type="number" class="form-control w-25" id="statValue_0" placeholder="Stat value">
    //   <button class="btn btn-outline-danger js-remove-stat" type="button">Remove</button>
    // </div>

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
    // <div class="d-flex gap-2 align-items-center js-next-stepCondition">
    //   <span>If</span>
    //   <input type="text" name="statName" class="form-control" id="" placeholder="Stat name">
    //   <select name="statOperator" class="form-select flex-shrink-1" id="">
    //     <option value="equals">equals</option>
    //     <option value="notEquals">not equals</option>
    //     <option value="lessThan">less than</option>
    //     <option value="greaterThan">greater than</option>
    //     <option value="lessOrEquals">less or equals</option>
    //     <option value="greaterOrEquals">greater or equals</option>
    //   </select>
    //   <input type="number" name="statValue" class="form-control flex-shrink-1 w-25" id="" placeholder="0">
    //   <span class="flex-shrink-0">then go to</span>
    //   <select class="form-select js-next-stepID-list" aria-label="Steps list"></select>
    //   <button class="btn btn-outline-danger js-remove-condition" type="button">Remove</button>
    // </div>

    const selectsList = document.getElementById('nextStepId_direct');
    //fill js-next-stepID-list of a new condition with options from js-next-stepID-list

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
};

constructor.init();