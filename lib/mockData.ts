import { Recipe } from './types';

export const INITIAL_CATEGORIES = ['家常菜', '硬菜', '素菜', '汤羹', '下饭菜'];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 1,
    title: '番茄炒蛋',
    category: ['家常菜', '下饭菜'],
    cover: 'https://picsum.photos/600/400?random=1',
    ingredients: [
      { name: '鸡蛋', amount: '3', unit: '个' },
      { name: '番茄', amount: '2', unit: '个' },
      { name: '葱花', amount: '10', unit: 'g' }
    ],
    seasonings: ['油', '盐', '糖', '番茄酱'],
    steps: [
      '鸡蛋打散炒熟备用。',
      '番茄切块炒出汁。',
      '混合翻炒加调料。'
    ],
    link: 'https://www.xiaohongshu.com/explore'
  },
  {
    id: 2,
    title: '青椒肉丝',
    category: ['硬菜', '家常菜'],
    cover: 'https://picsum.photos/600/400?random=2',
    ingredients: [
      { name: '猪瘦肉', amount: '200', unit: 'g' },
      { name: '青椒', amount: '3', unit: '个' },
      { name: '姜', amount: '5', unit: 'g' }
    ],
    seasonings: ['油', '盐', '生抽', '料酒', '淀粉'],
    steps: [
      '肉丝腌制。',
      '青椒切丝。',
      '大火快炒。'
    ]
  },
  {
    id: 3,
    title: '紫菜蛋花汤',
    category: ['素菜', '汤羹'],
    cover: 'https://picsum.photos/600/400?random=3',
    ingredients: [
      { name: '鸡蛋', amount: '1', unit: '个' },
      { name: '干紫菜', amount: '10', unit: 'g' }
    ],
    seasonings: ['盐', '香油', '葱花'],
    steps: [
      '水烧开。',
      '放入紫菜和蛋液。',
      '出锅淋香油。'
    ]
  }
];
