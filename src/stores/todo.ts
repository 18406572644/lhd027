import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Todo } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import dayjs from 'dayjs'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])

  const todayTodos = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return todos.value.filter(todo => {
      if (todo.completed) return false
      if (!todo.dueDate) return true
      return dayjs(todo.dueDate).isSame(today, 'day')
    })
  })

  const saveTodos = () => {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos.value))
  }

  const loadTodos = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.TODOS)
    if (saved) {
      try {
        todos.value = JSON.parse(saved)
      } catch (e) {
        todos.value = []
      }
    }
  }

  const addTodo = (title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      dueDate,
      priority
    }
    todos.value.push(newTodo)
    saveTodos()
    return newTodo
  }

  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      saveTodos()
    }
  }

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
    saveTodos()
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value[index] = { ...todos.value[index], ...updates }
      saveTodos()
    }
  }

  const clearCompleted = () => {
    todos.value = todos.value.filter(t => !t.completed)
    saveTodos()
  }

  return {
    todos,
    todayTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    loadTodos,
    clearCompleted
  }
})
