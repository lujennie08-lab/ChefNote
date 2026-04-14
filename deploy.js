#!/usr/bin/env node

/**
 * ChefNote 部署脚本
 * 用于部署到 CloudBase
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 ChefNote 部署开始');
console.log('═══════════════════════════════════════');

const commands = [
  {
    name: '📦 部署前端 (静态托管)',
    cmd: 'cloudbase',
    args: ['hosting:deploy', 'dist/', '--path', '/']
  }
];

// 执行命令
async function runCommand(name, cmd, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n${name}`);
    console.log('─────────────────────────────');

    const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });

    proc.on('close', code => {
      if (code === 0) {
        console.log(`✅ ${name} 完成\n`);
        resolve();
      } else {
        console.log(`❌ ${name} 失败 (代码: ${code})\n`);
        reject(new Error(`${name} 失败`));
      }
    });

    proc.on('error', err => {
      console.error(`❌ 错误: ${err.message}`);
      reject(err);
    });
  });
}

// 主函数
async function deploy() {
  try {
    // 部署前端
    await runCommand(commands[0].name, commands[0].cmd, commands[0].args);

    console.log('═══════════════════════════════════════');
    console.log('✅ 部署完成！');
    console.log('');
    console.log('📱 应用地址:');
    console.log('   https://chefnote-v1-6glzfl9g4e98cc89-1346916059.tcloudbaseapp.com');
    console.log('');
    console.log('⚠️  注意:');
    console.log('   • 图片上传功能需要后端支持');
    console.log('   • 如果后端未部署，请手动部署云函数');
    console.log('   • 命令: cloudbase functions:deploy');

    process.exit(0);
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

deploy();
