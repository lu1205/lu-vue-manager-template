import { request } from '@/utils/request'

// 登录
export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'POST',
    data,
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/user/logout',
    method: 'get',
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/user/userInfo',
    method: 'get',
  })
}

// 获取用户权限
export const getUserPermission = () => {
  return request({
    url: '/user/userPermission',
    method: 'get',
  })
}

/**
 * 菜单管理
 */

// 获取列表
export const getMenuList = () => {
  return request({
    url: '/menu/list',
    method: 'get',
  })
}

// 新增
export const addMenu = (data: unknown) => {
  return request({
    url: '/menu/add',
    method: 'post',
    data,
  })
}

// 详情
export const getMenuDetail = (params: unknown) => {
  return request({
    url: '/menu/detail',
    method: 'get',
    params,
  })
}

// 修改
export const editMenu = (data: unknown) => {
  return request({
    url: '/menu/edit',
    method: 'post',
    data,
  })
}

// 删除
export const deleteMenu = (data: unknown) => {
  return request({
    url: '/menu/delete',
    method: 'post',
    data,
  })
}

/**
 * 角色管理
 */

// 所有角色
export const getAllRole = () => {
  return request({
    url: '/role/all',
    method: 'get',
  })
}

// 列表
export const getRoleList = (params: any, data: any) => {
  return request({
    url: '/role/list',
    method: 'post',
    params,
    data,
  })
}

// 新增
export const addRole = (data: any) => {
  return request({
    url: '/role/add',
    method: 'post',
    data,
  })
}

// 详情
export const getRoleDetail = (params: any) => {
  return request({
    url: '/role/detail',
    method: 'get',
    params,
  })
}

// 修改
export const editRole = (data: any) => {
  return request({
    url: '/role/edit',
    method: 'post',
    data,
  })
}

// 启用/停用
export const changeRoleStatus = (data: any) => {
  return request({
    url: '/role/status',
    method: 'post',
    data,
  })
}

// 删除
export const deleteRole = (data: any) => {
  return request({
    url: '/role/delete',
    method: 'post',
    data,
  })
}

// 批量删除
export const batchDeleteRole = (data: any) => {
  return request({
    url: '/role/batchDelete',
    method: 'post',
    data,
  })
}

// 权限详情
export const getPermissionDetail = (params: any) => {
  return request({
    url: '/role/permissionDetail',
    method: 'get',
    params,
  })
}

// 设置权限
export const editPermissions = (data: any) => {
  return request({
    url: '/role/editPermissions',
    method: 'post',
    data,
  })
}

/**
 * 用户管理
 */

// 列表
export const getUserList = (params: any, data: any) => {
  return request({
    url: '/user/list',
    method: 'post',
    params,
    data,
  })
}

// 新增
export const addUser = (data: any) => {
  return request({
    url: '/user/add',
    method: 'post',
    data,
  })
}

// 详情
export const getUserDetail = (params: any) => {
  return request({
    url: '/user/detail',
    method: 'get',
    params,
  })
}

// 修改
export const editUser = (data: any) => {
  return request({
    url: '/user/edit',
    method: 'post',
    data,
  })
}

// 启用/停用
export const changeUserStatus = (data: any) => {
  return request({
    url: '/user/status',
    method: 'post',
    data,
  })
}

// 删除
export const deleteUser = (data: any) => {
  return request({
    url: '/user/delete',
    method: 'post',
    data,
  })
}

// 批量删除
export const batchDeleteUser = (data: any) => {
  return request({
    url: '/user/batchDelete',
    method: 'post',
    data,
  })
}

// 获取用户角色
export const getUserRoleDetail = (params: any) => {
  return request({
    url: '/user/getRoles',
    method: 'get',
    params,
  })
}

// 设置用户角色
export const editUserRole = (data: any) => {
  return request({
    url: '/user/editRole',
    method: 'post',
    data,
  })
}

/**
 * 系统日志
 */

// 列表
export const getLogList = (params: any, data: any) => {
  return request({
    url: '/logs/list',
    method: 'post',
    params,
    data,
  })
}

// 详情
export const getLogDetail = (params: any) => {
  return request({
    url: '/logs/detail',
    method: 'get',
    params,
  })
}
