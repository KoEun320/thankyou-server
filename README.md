# Introduction
**THANKYOU 365**는 소소한 감사한것들을 올리고 타인 또는 본인이 올린 감사글을 보는 웹사이트 입니다.

![snapshot2](https://user-images.githubusercontent.com/34699932/43944181-053d00f0-9cb9-11e8-9c80-f8afbb88fce0.png)

## Requirements
- Chrome Browser를 권장합니다

## Features
- 회원가입 및 로그인 구현
- JSON Web Token Authentication
- 닉네임 수정 및 회원 탈퇴
- 글쓰기 및 수정
- 내가 쓴글 공개/비공개
- 좋아요 기능
- 랜덤으로 타인이 쓴 감사글 보기

## Client-Side
- React로 UI아키텍쳐 구현
- Redux로 state관리
- middleware : Redux-Thunk로 자유로운 dispatch 사용
- middleware : Redux-logger로 개발시 action및 state debugging 간편화
- CSS : BootStrap 프레임워크 사용

## Server-Side
- Node.js
- Node.js 웹 어플리케이션 프레임워크 Express
- JSON Web Token Authentication
- NoSQL 데이터베이스, MongoDB
- MongoDB 기반의 Node.js 전용 ODM 라이브러리 Mongoose
- MongoDB 호스팅 플랫폼 mlab 사용
