import { notifications } from '@mantine/notifications'

export const showSuccess = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'green',
    autoClose: 4000
  })
}

export const showError = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'red',
    autoClose: 6000
  })
}

export const showInfo = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'blue',
    autoClose: 4000
  })
}

export const showWarning = (title: string, message: string) => {
  notifications.show({
    title,
    message,
    color: 'orange',
    autoClose: 5000
  })
}

// Common notification messages for CRUD operations
export const showCreateSuccess = (entity: string, name: string) => 
  showSuccess(`${entity} Created`, `${name} has been created successfully`)

export const showUpdateSuccess = (entity: string, name: string) => 
  showSuccess(`${entity} Updated`, `${name} has been updated successfully`)

export const showDeleteSuccess = (entity: string, name: string) => 
  showSuccess(`${entity} Deleted`, `${name} has been deleted successfully`)

export const showCreateError = (entity: string, error: string) => 
  showError(`Failed to Create ${entity}`, error)

export const showUpdateError = (entity: string, error: string) => 
  showError(`Failed to Update ${entity}`, error)

export const showDeleteError = (entity: string, error: string) => 
  showError(`Failed to Delete ${entity}`, error)