---
title: "Jenkins Pipeline 사용시 Docker를 찾을 수 없다는 에러"
description: "Jenkins Pipeline 사용시 Docker를 찾을 수 없다는 에러"
date: 2021-02-24
update: 2021-02-24
tags:
  - 기타
  - Jenkins
---

Jenkins Pipeline에서 Dockerd 이미지를 빌드하고 Docker Hub에 업로드 하려고 다음과 같은 명령어를 통해 Image를 빌드 하게 했습니다.

```cpp
stage('Build Docker Image') {
      when {
        anyOf {
          branch 'develop'
          branch 'main'
        }

      }
      steps {
        script {
          unstash 'build-artifacts'
          dockerImage = docker.build imageName
        }

      }
    }
```

### docker: not found

엥..? 그런데 다음과 같이 docekr를 찾을수 없다고 합니다.

```bash
+ docker build -t riyenas0925/spring_boot_sandbox .
/var/jenkins_home/workspace/Spring_Boot_SandBox_develop@tmp/durable-462c5063/script.sh: 1: /var/jenkins_home/workspace/Spring_Boot_SandBox_develop@tmp/durable-462c5063/script.sh: docker: not found
script returned exit code 127
```

오류를 찾아보니 아래와 같은 방법으로 해결할 수 있다고 합니다.

### 해결방법

1. docker가 설치되어 있는 jenkins 이미지 파일을 사용한다.
2. docker exec 명령어로 컨테이너 내부로 접속한 다음 내부에 docker를 설치한다.
3. docker 경로와 docker.sock 파일 경로를 도커 볼륨에 추가해 사용한다.

[Docker not found when building docker image using Docker Jenkins container pipeline](https://stackoverflow.com/questions/44850565/docker-not-found-when-building-docker-image-using-docker-jenkins-container-pipel)

3가지 방법중 3번을 추천하기에 3번으로 진행했습니다. 아래와 같이 도커 볼륨을 추가해주면 된다고 하네요 저는 docker-compose에 추가 해줬습니다.

```bash
- /var/run/docker.sock:/var/run/docker.sock
- /usr/bin/docker:/usr/bin/docker
```

이번엔 아래처럼 Permission denied 오류가 발생합니다.

### docker: Permission denied

```bash
+ docker build -t riyenas0925/spring_boot_sandbox .
/var/jenkins_home/workspace/Spring_Boot_SandBox_develop@tmp/durable-cb9d6046/script.sh: 1: /var/jenkins_home/workspace/Spring_Boot_SandBox_develop@tmp/durable-cb9d6046/script.sh: docker: Permission denied
script returned exit code 127
```

### 해결방법

아래 명령어로 권한을 부여한다음 도커 컨테이너를 **삭제**하고 **실행** 하면 정상적으로 동작합니다.

```bash
sudo chown +x /usr/bin/docker
sudo chmod +x /var/run/docker.sock
```

![Jenkins%20Pi%2021ce5/Untitled.png](Jenkins%20Pi%2021ce5/Untitled.png)

이미지도 정상적으로 올라옵니다.

![Jenkins%20Pi%2021ce5/Untitled%201.png](Jenkins%20Pi%2021ce5/Untitled%201.png)