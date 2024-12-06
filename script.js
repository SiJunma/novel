const app = {
  chapters: null,
  sideChapters: null,
  currentChapter: null,
  currentStep: null,
  stats: {},
  logs: [],
  progressKey: 'novelProgress',

  init() {
    fetch('stepsData.json')
      .then(response => response.json())
      .then(data => {
        this.chapters = data.chapters;
        this.sideChapters = data.sideChapters;

        const stepsSelect = document.getElementById('step-select');

        this.chapters.forEach(chapter => {
          const parentChapterTitle = chapter.title;

          const steps = chapter.steps;
          steps.forEach(step => {
            const option = document.createElement('option');
            option.value = step.id;
            option.text = `${parentChapterTitle} - ${step.name}`;
            stepsSelect.add(option);
          });
        });

        if (this.sideChapters.length > 0) {
          this.sideChapters.forEach(chapter => {
            const parentChapterTitle = chapter.title;

            const steps = chapter.steps;
            steps.forEach(step => {
              const option = document.createElement('option');
              option.value = step.id;
              option.text = `${parentChapterTitle} - ${step.name}`;
              stepsSelect.add(option);
            });
          });
        };
        
        stepsSelect.addEventListener('change', () => {
          const selectedStepId = stepsSelect.value;
          this.loadStep(selectedStepId);
          stepsSelect.value = '';
        });

        const savedProgress = this.loadProgress();
        if (savedProgress) {
          this.stats = savedProgress.stats;
          this.logs = savedProgress.logs;
          this.currentChapter = this.chapters.find(ch => ch.id === savedProgress.currentChapterId) || this.sideChapters.find(ch => ch.id === savedProgress.currentChapterId);
          this.currentStep = this.currentChapter.steps.find(st => st.id === savedProgress.currentStepId) || this.currentChapter.steps.find(st => st.id === savedProgress.currentStepId);
        } else {
            this.loadChapter("chapter1");
        };

        this.updateUI();
        this.render();
      })
      .catch(error => console.error("Error loading data:", error));
  },

  loadChapter(chapterId) {
      this.currentChapter = this.chapters.find(ch => ch.id === chapterId);
      this.currentStep = this.currentChapter.steps[0];
      this.saveProgress();
      this.render();
  },

  loadStep(stepId) {
    
      const allSteps = [...this.chapters.flatMap(ch => ch.steps), ...this.sideChapters.flatMap(ch => ch.steps)];
      
      this.currentStep = allSteps.find(st => st.id === stepId);
      this.currentChapter = this.chapters.find(ch => ch.steps.some(st => st.id === stepId)) || this.sideChapters.find(ch => ch.steps.some(st => st.id === stepId));

      this.saveProgress();
      this.render();
  },

  makeChoice(choice) {
    for (let stat in choice.stats) {
      if (this.stats[stat]) {
          this.stats[stat] += choice.stats[stat];
      } else {
          this.stats[stat] = choice.stats[stat];
      };
    };

    this.logs.push({
      chapterId: this.currentChapter.id,
      stepId: this.currentStep.id,
      choiceText: choice.text,
      choiceStats: choice.stats,
      value: choice.value,
      title: this.currentChapter.title,
      name: this.currentStep.name
    });

    const nextStep = choice.nextStepId;
    if(nextStep) {
      this.loadStep(nextStep);
    };

    this.saveProgress();
    this.render();
  },

  render() {
    document.getElementById("chapter-title").textContent = this.currentChapter.title;
    document.getElementById("chapter-subtitle").textContent = this.currentStep.name;
    const stepTextContainer = document.getElementById("step-text");
    stepTextContainer.innerHTML = this.currentStep.text.replace(/\n/g, "<br>");

    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";
    this.currentStep.choices?.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice.text;
        button.className = "btn";
        button.setAttribute("type", "button");
        button.onclick = () => this.makeChoice(choice);
        choicesContainer.appendChild(button);
    });

    const statsList = document.getElementById("stats-container");
    for (let stat in this.stats) {
        const statElement = document.createElement("div");
        statElement.textContent = `${stat}: ${this.stats[stat]}`;
        statsList.appendChild(statElement);
    };

    const logsContainer = document.getElementById("logs-container");
    logsContainer.style.display = this.logs?.length > 0 ? "block" : "none";
    this.logs?.forEach(log => {
        const logElement = document.createElement("div");
        logElement.textContent = `Chapter: ${log.title}, Step: ${log.name}, Choice: ${log.value ? log.value : log.choiceText}`;
        logsContainer.appendChild(logElement);
    });
  },

  saveProgress() {
    const progress = {
      currentChapterId: this.currentChapter.id,
      currentStepId: this.currentStep.id,
      stats: this.stats,
      logs: this.logs
    };
    localStorage.setItem(this.progressKey, JSON.stringify(progress));
    this.updateUI();
  },

  loadProgress() {
    const savedProgress = localStorage.getItem(this.progressKey);
    return savedProgress ? JSON.parse(savedProgress) : null;
  },

  resetProgress() {
    if (confirm("Are you sure you want to reset the progress?")) {
      localStorage.removeItem(this.progressKey);
      this.stats = {};
      this.logs = [];
      this.loadChapter("chapter1");
      this.updateUI();
    }
  },

  updateUI() {
    document.getElementById("progressBox").style.display = this.logs?.length > 0 ? "block" : "none";
    document.getElementById("logs").style.display = this.logs?.length > 0 ? "block" : "none";
    document.getElementById("stats").style.display = Object.keys(this.stats).length > 0 ? "block" : "none";
    document.getElementById("stats-container").innerHTML = "";
    document.getElementById("logs-container").innerHTML = "";
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("reset-button").onclick = () => app.resetProgress();
});

app.init();
