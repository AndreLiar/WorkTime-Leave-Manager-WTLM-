# Changelog

## [1.0.3](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/compare/v1.0.2...v1.0.3) (2026-03-27)


### 🐛 Bug Fixes

* patch Alpine OS vulnerabilities with apk upgrade in both Docker stages ([db875e9](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/db875e9b9aa9920a1f4e44bf8862e9e072b746b6))
* pin node base image to 20.19.1-alpine3.21 to resolve Dockerfile warnings ([f5b8f97](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/f5b8f97fa96ae34eb9c68099dd8b62d2314b70ef))

## [1.0.2](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/compare/v1.0.1...v1.0.2) (2026-03-26)


### 🐛 Bug Fixes

* remove prisma.config.ts reference from Dockerfile ([3ca0926](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/3ca092687135a89455bcc3eed900e29d622a167b))
* restore prisma.config.ts required by Prisma 7 CLI ([5da693d](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/5da693d0d589fcc3e9512772fda4ab3a3fe2b058))


### 🔧 CI/CD

* add prisma:generate before build in release workflow ([297ce3a](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/297ce3a0bacc141f4674167fe7740a5ae45ff109))

## [1.0.1](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/compare/v1.0.0...v1.0.1) (2026-03-26)


### 🔧 CI/CD

* re-trigger release-please after enabling PR creation permission ([cd7c467](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/cd7c4670d651748a70b7fa729ffbf7c30031c436))
* trigger release-please after baseline tag v1.0.0 ([3b01d74](https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-/commit/3b01d74ef5d598ee126063faa2aa49dd2c5a9afe))
