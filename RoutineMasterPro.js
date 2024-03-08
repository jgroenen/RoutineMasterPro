// RoutineMasterPro
export default {
    name: 'RoutineMasterPro',
  
    data() {
      let routines = localStorage.getItem('routines');
      if (routines) {
        routines = JSON.parse(routines);
      } else {
        routines = [];
        localStorage.setItem('routines', JSON.stringify(routines));
      }
      return { 
        routines,
        newRoutine: { id: null, name: '', description: '', tasks: [] },
        selectedRoutine: null,
        newTask: { name: '', duration: '', website: '' },
        timer: null, // Holds the setInterval reference
        elapsedTime: 0, // Tracks the elapsed time in seconds
      };
    },

    computed: {
      totalDuration() {
        if (!this.selectedRoutine || !this.selectedRoutine.tasks) {
          return 0;
        }
        return this.selectedRoutine.tasks.reduce((total, task) => total + Number(task.duration), 0);
      },
      currentTaskId() {
        let totalTimeInSeconds = 0;
        if (!this.selectedRoutine || !this.selectedRoutine.tasks.length) {
          return null; // No current task if there are no tasks
        }
        for (let task of this.selectedRoutine.tasks) {
          totalTimeInSeconds += Number(task.duration) * 60; // Convert minutes to seconds
          if (totalTimeInSeconds > this.elapsedTime) {
            return task.id;
          }
        }
        return null; // No current task if elapsed time exceeds total duration of tasks
      }
    },    

    methods: {
      addTaskToRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (routine) {
          const newTaskId = routine.tasks.length + 1; // Simple ID assignment
          const newTask = {
            id: newTaskId,
            ...this.newTask
          };
          routine.tasks.push(newTask);
    
          // Optional: Persist to localStorage
          localStorage.setItem('routines', JSON.stringify(this.routines));
    
          // Reset newTask form data
          this.newTask = { name: '', duration: '', website: '' };
        }
      },
      removeRoutine(routineId) {
        this.routines = this.routines.filter(routine => routine.id !== routineId);
        localStorage.setItem('routines', JSON.stringify(this.routines));
      },
      addRoutine() {
        if (this.newRoutine.name.trim() && this.newRoutine.description.trim()) {
          this.newRoutine.id = this.routines.length + 1;
          this.routines.push({...this.newRoutine});
          localStorage.setItem('routines', JSON.stringify(this.routines));
          this.newRoutine = { id: null, name: '', description: '', tasks: [] };
        }
      },
      selectRoutine(routine) {
        this.selectedRoutine = routine;
      },
      startTimer() {
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
          this.elapsedTime++;
        }, 1000); // Update elapsed time every second
      },
      
      stopTimer() {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      
      resetTimer() {
        this.stopTimer();
        this.elapsedTime = 0;
      },
      
      formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return [hours, minutes, remainingSeconds]
          .map(unit => unit.toString().padStart(2, '0')) // Ensure two digits
          .join(':');
      }
    },    
  
    template: `
      <div class="app-container">

        <div class="add-routine">
          <input v-model="newRoutine.name" placeholder="Routine Name" class="input-field" />
          <input v-model="newRoutine.description" placeholder="Description" class="input-field" />
          <button @click="addRoutine" class="add-button">Add Routine</button>
        </div>

        <ul class="routine-list">
          <li v-for="routine in routines" :key="routine.id" class="routine-item">
            <button @click="removeRoutine(routine.id)" class="remove-button">×</button>
            <div @click="selectRoutine(routine)" class="routine-content">
              <h3>{{ routine.name }}</h3>
              <p>{{ routine.description }}</p>
            </div>
          </li>
        </ul>      

        <!-- Full-screen overlay/backdrop -->
        <div class="detail-view-backdrop" v-if="selectedRoutine" @click="selectedRoutine = null">

          <!-- Detail view with tasks displayed as a table -->
          <div class="routine-detail" v-if="selectedRoutine" @click.stop>
            <button @click="selectedRoutine = null" class="close-detail-button">×</button>

            <!-- Timer display -->
            <div class="timer-display">
              {{ formatTime(elapsedTime) }}
            </div>          
            
            <h2>{{ selectedRoutine.name }}</h2>
            <p>{{ selectedRoutine.description }}</p>
          
            <!-- Table for tasks -->
            <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration</th>
                <th>Website</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in selectedRoutine.tasks" :key="task.id" :class="{'highlight-task': task.id === currentTaskId}">
                <td>{{ task.name }}</td>
                <td>{{ task.duration }} min</td>
                <td><a :href="task.website" target="_blank">{{ task.website }}</a></td>
              </tr>
            </tbody>
          </table>

            <!-- Display the total duration -->
            <div class="total-duration">
              Total Duration: {{ totalDuration }} minutes
            </div>
          
            <!-- Form to add a new task with styled inputs and inline [ + ] button -->
            <div class="form-container">
              <div class="form-row">
                <input type="text" v-model="newTask.name" placeholder="Task Name" />
                <input type="text" v-model="newTask.duration" placeholder="Duration" />
                <input type="text" v-model="newTask.website" placeholder="Website Link" />
                <button @click="addTaskToRoutine(selectedRoutine.id)">+</button>
              </div>
            </div>            

            <!-- Timer controls -->
            <div class="timer-controls">
              <button @click="startTimer()">Start</button>
              <button @click="stopTimer()">Stop</button>
              <button @click="resetTimer()">Reset</button>
            </div>

          </div>        

        </div>

      </div>
    `
  };
  