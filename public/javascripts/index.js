$(()=>{

	var level = 1
	var toolIndex = 0
	var modeEdition = false
	var editWorks = []


	Date.prototype.getWeek = function(relatif) {
	  var date = new Date(this.getTime());
	   date.setHours(0, 0, 0, 0);

	  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

	  var week1 = new Date(relatif ? date.getFullYear() : 0, 0, 4);
	  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
	                        - 3 + (week1.getDay() + 6) % 7) / 7);
	}

	function loadToolsList(){
		tools.forEach((tool, i) =>{
			$('#listTool').append(`
				<li id="tool${i}" data-index="${i}" data-content="${tool.name}" class="tool">
					${tool.name}
					<i class="fas fa-circle w3-hide w3-right decovi-blue-txt notification"></i>
					<i data-index="${i}" class="fas fa-edit w3-hide w3-right w3-large openWorkForm"></i>
				</li>`
			)

			tool.works = []
			tool.worksId.map(w => works[works.map(v => v.id).indexOf(w)])
					.filter(w => w)
					.forEach(w => 
						tool.works.push({
							level: w.level,
							title: w.title,
							img: w.img,
							step: w.step,
							frq: w.frq,
							todo: new Date().getWeek() % w.frq == 0
						})
					)

			$(`#tool${i}`).hover(function(){
				if (modeEdition) $(this).children('.openWorkForm').removeClass('w3-hide')
			}, function(){
				$(this).children('.openWorkForm').addClass('w3-hide')
			})
		})
	}



	loadToolsList()
	toolsCheck()

	function toolsCheck(){
		if (!modeEdition) {
			tools.forEach((tool, i) => {
				if (tool.works.filter(w => w.todo).length > 0) {
					//TODO: Faire remonter les machine a faire
					$(`#tool${i} .notification`).removeClass('w3-hide')
				}else{
					$(`#tool${i} .notification`).addClass('w3-hide')
				}
			})
		}
	}

	function levelCheck(){
		if (!modeEdition) {
			for (var i = 0; i < 3; i++) {
				if(tools[toolIndex].works.filter(w => w.level == i + 1).filter(w => w.todo).length > 0){
					$(`#levelSelect${i+1} .notification`).removeClass('w3-hide')
				}else{
					$(`#levelSelect${i+1} .notification`).addClass('w3-hide')
				}
			}
		}
	}


	function ChargeFollowedList(){
		$('#followedlist').html('')
		var day    = 24*60*60*1000
		var startOne = new Date().getTime() - 365 * day  	// il y une année
		var startTwo = new Date().getTime() -  30 * day  	// il y a trente jours
		var endOne 	 = new Date().getTime() +  30 * day 	// dans trente jours
		var endTwo 	 = new Date().getTime() + 365 * day 	// dans une année
		var nbLimitEndTwo = 5				 				// NB max de semaines lointaines affichées
		var nb = 0

		function todo(i){
			//TODO : getWeek en fonction d'une date fix et pas depuis le début d'année
			var week = new Date(i).getWeek()
			return tools[toolIndex].works
					.filter(w => w.level == level)
					.filter(w => week % w.frq == 0).length > 0
		}

		// Passé lointain
		
		for (var i = startTwo - 7 * day; i >= startOne && nb < nbLimitEndTwo; i -= 7 * day){
			if (todo(i)) {
				var time = new Date(i)
				var week = time.getWeek(1)
				var id = `week${time.getFullYear()}${week}`

				$('#followedlist').prepend(`
					<li id="${id}" class="">S${week}</li>
				`)
				//TODO: utilisé des vrai donnée...

				if (time < new Date()) {
					if (Math.random() < 0.2) {
						$(`#${id}`).append(`<i class="fas fa-times w3-large w3-right"></i>`)
					}else{
						$(`#${id}`).append(`<i class="fas fa-check w3-large w3-right"></i>`)
					}	
				}	
				++nb				
			}
		}
		


		// Passé proche, future proche et présent

		for (var i = startTwo; i < endOne; i += 7 * day ){
			var time = new Date(i)
			var week = time.getWeek()
			var id = `week${time.getFullYear()}${week}`

			$('#followedlist').append(`
				<li id="${id}">S${time.getWeek(1)}</li>
			`)
			
			if (time.getWeek() == new Date().getWeek()) $(`#${id}`).addClass('w3-large').append(` <i class="fas fa-angle-left w3-large"></i>`)


			if (todo(i)) {

				//TODO: utilisé des vrai donnée...

				var time = new Date(i)

				if (time.getWeek() == new Date().getWeek()) {
					if (tools[toolIndex].works
					.filter(w => w.level == level)
					.filter(w => w.todo).length == 0){
						$(`#${id}`).append(`<i class="fas fa-check w3-large w3-right"></i>`)
					}
				}else{
					if (time < new Date()) {
						if (Math.random() < 0.2) {
							$(`#${id}`).append(`<i class="fas fa-times w3-large w3-right"></i>`)
						}else{
							$(`#${id}`).append(`<i class="fas fa-check w3-large w3-right"></i>`)
						}
					}					
				}
			}else{
				$(`#${id}`).css('opacity', '0.2')
			}
		}

		// Future lointain
		
		nb = 0
		for (var i = endOne; i <= endTwo && nb < nbLimitEndTwo; i += 7 * day){
			var time = new Date(i)
			var week = time.getWeek()
			var id = `week${time.getFullYear()}${week}`
			if (todo(i)) {
				$('#followedlist').append(`
					<li id="${id}" class="">S${new Date(i).getWeek(1)}</li>
				`)
				++nb
			}
		}
		


		// pour le check du jour...

		if (tools[toolIndex].works
				.filter(w => w.level == level)
				.filter(w => w.todo).length == 0) {
			$(`#week${new Date().getWeek()}`).append(`<i class="fas fa-check w3-large w3-right"></i>`)
		}

	}


	//Filtre
	$('#search').keyup(function(){
		var val  = $(this).val().toLowerCase()
		var newSelect = -1
		tools.forEach((tool, i) => {
			if (val != '' && $(`#tool${i}`).data('content').toLowerCase().indexOf(val) == -1) {
				$(`#tool${i}`).css('display', 'none')
			}else{
				$(`#tool${i}`).css('display', 'list-item')
				if (newSelect == -1) newSelect = i
			}
		})

		if (newSelect != -1) {
			$(`.tool`).removeClass('decovi-blue')
			$(`#tool${newSelect}`).addClass('decovi-blue')
			toolIndex = newSelect
			ChargeContent()
			levelCheck()
		}

		//Mode édition
		if (!modeEdition && val == 'admin') {
			alert('Vous entrez dans le mode édition !\nTapez "exit" dans la recherche pour quitter.')
			modeEdition = true
			$(this).val('')
			$('#search').keyup()
			//TODO: charger
			//TODO: Peu etre retirer ?
			$('.modeEdition').removeClass('w3-hide')
			$('.notification').addClass('w3-hide')
			$('.openWorkForm').addClass('w3-hide')
			$('#doBtn, #printBtn').addClass('w3-hide')

		}else if (modeEdition && val == 'exit'){
			modeEdition = false
			$(this).val('')
			$('#search').keyup()
			//TODO: Peu etre retirer ?
			$('.notification').removeClass('w3-hide')
			$('.modeEdition').addClass('w3-hide')
			$('#printBtn').removeClass('w3-hide')
			if (tools[toolIndex].works.filter(w => w.level == level).filter(w => w.todo).length > 0) {
				$('#doBtn').removeClass('w3-hide')			
			}
			
		}

	})

	$('#searchWork').keyup(function(){
		var val = $(this).val().toLowerCase()
		$('.workList').removeClass('w3-hide')
		works.filter(w => w.title.toLowerCase().indexOf(val) == -1)
			.forEach(w => $(`#editWork${w.id}`).addClass('w3-hide'))
	})

	var newWork = {}

	function addWork(work, prepend){
		var str = `
			<li id="editWork${work.id}" data-work="${work.id}" class="workList">
				${work.title}
				<i data-work="${work.id}" class="far fa-edit modifyWork w3-large w3-right w3-padding w3-hide" style="margin-top: -6px;"></i>
			</li>
		`
		prepend ? $('#worksList').prepend(str) : $('#worksList').append(str)	
	}

	//openWorkForm() //TODO: a supprimer
	function openWorkForm(){

		$('#workFormWindow').css('display', 'block')
		$('#toolTitle').html(tools[toolIndex].name)
		loadWorkList()

	}

	function loadWorkList(){
		$('#worksList').html('')
		works.forEach(addWork)
		editWorks = works.filter(work => tools[toolIndex].worksId.indexOf(work.id) != -1)
		editWorks.forEach(work => {
			$(`#editWork${work.id}`).addClass('decovi-blue')
			$('#worksList').prepend($(`#editWork${work.id}`))
		})
		$('#worksList li').hover(function(){
			if (!$('#newWork').hasClass('w3-disabled')) {

				loadWorkViewer(works[works.map(w => w.id).indexOf($(this).data('work'))])

				$('.modifyWork').addClass('w3-hide')			
				$(this).children('.modifyWork').removeClass('w3-hide')					
			}
		})		
	}


	function loadWorkViewer(work){
		$('#workTitle').html(work.title)

		work.img ? $('#workImg').attr('src', `images/${work.img}`) : $('#workImg').attr('src', ``)
		$('#workImg').removeClass('w3-hide')

		var frqStr = work.frq == 1 ? 'Hebdomadaire' : `Toutes les ${work.frq} semaines`
		$('#workStepList').html(`
			<span class="w3-margin w3-small w3-opacity">
			Niveau ${work.level} -> ${frqStr}</span>`)
		work.step.forEach(step => {
			$('#workStepList').append(`<li>${step}</li>`)
		})
	}


	//Charge liste d'images
	$.get('images', images => {
		images.forEach(image => {
			var imgName = image.substr(0, image.length - 4)
			$('#imgList').append(`
				<li id="${imgName}" data-img="${image}" class="w3-right">${imgName}</li>
			`)
		})

		$('#imgList li').hover(function(){
			$('#workImg').attr('src', `images/${$(this).data('img')}`)
		})


		$('#imgList li').click(function(){
			$('#imgList li').removeClass('decovi-blue')
			$(this).addClass('decovi-blue')
			newWork.img = $(this).data('img')
			checkNewWork()
		})

		$('#imgList').hover(function(){}, function(){
			$('#workImg').attr('src', `images/${newWork.img}`)
		})		

	})

	$('#worksList').click(function(e) {
		var work = works[works.map(w => w.id).indexOf($(e.target).data('work'))]
		var index = editWorks.indexOf(work)
		$('#editWork').removeClass('w3-disabled')
		if ($(e.target).hasClass('modifyWork')) {
			newWork = work
			$('#createWork').removeClass('w3-disabled')
			$('#saveWork').removeClass('w3-disabled')
			loadWorkForm()
		}else{
			if (index == -1) {
				if (work) editWorks.push(work)
			}else{
				editWorks.splice(index, 1)
			}

			$('#saveWork').removeClass('w3-disabled')
			$('#worksList li').removeClass('decovi-blue')
			editWorks.forEach(w => {
				$(`#editWork${w.id}`).addClass('decovi-blue')
			})				
		}

	})


	$('#newWork').click(function(){
		newWork = {title: '', level: 0, img: '', step: [], frq: 1, copy: false}

		$('#createWork').addClass('w3-disabled')
		$('#saveWork').addClass('w3-disabled')
		loadWorkForm()
	})

	function loadWorkForm(){

		//form
		$('#workTitle').html(`<input class="w3-input" type="text" placeholder="Nouveau titre" value="${newWork.title}">`)
		$('#workTitle input').focus()
		$('#workImg').css('max-width', '50%')
		$('#worksList').addClass('w3-disabled')
		$('#imgList').removeClass('w3-hide')
		$('#imgList li').removeClass('decovi-blue')
		if (newWork.img != '') $(`#${newWork.img.substr(0, newWork.img.length - 4)}`).addClass('decovi-blue')
		$('#workImg').attr('src', `images/${newWork.img}`)

		$('#workStepList').html(`
			Niveau: 
			${getLevelBtnHtml(1)}
			${getLevelBtnHtml(2)}
			${getLevelBtnHtml(3)}
			Toute les <input id="newWorkFrq" type="number" min="1" value="${newWork.frq}" class="w3-round w3-center" style="max-width: 40px; border: 1px solid;"> semaines<br>
		`)

		if (newWork.level > 0) {
			$('.levelBtn').removeClass('decovi-blue')
			$(`#levelBtn${newWork.level}`).addClass('decovi-blue')
		}

		//Ecoute des mises a jour (img plus haut et pas d'écoute sur les steps)
		$('#workTitle input').keyup(function(){
			newWork.title = $(this).val()
			checkNewWork()
		})

		$('.levelBtn').click(function(){
			$('.levelBtn').removeClass('decovi-blue')
			$(this).addClass('decovi-blue')
			newWork.level = $(this).data('level')
			checkNewWork()
		})

		$('#newWorkFrq').on('click keyup', function() {
			newWork.frq = Number($(this).val())
			checkNewWork()
		})

		if (newWork.step.length == 0) {
			newStepDynamic('', 0)
		}else{
			newWork.step.forEach(newStepDynamic)
			newStepDynamic('', newWork.step.length)
		}

		//buttons
		$('#newWork').addClass('w3-disabled')		
		$('#createWork').removeClass('w3-hide')
	}

	function getLevelBtnHtml(level){
		return `<span id="levelBtn${level}" data-level="${level}" class="levelBtn w3-button w3-round"> ${level} </span>`
	}

	function getNewStepInput(step, index){
		return `<li id="step${index}" data-step="${index}" class="newStep"><input value="${step}" class="w3-input" type="text" placeholder="Tâche n°${index + 1}" style="width: 100%;"></li>`
	}

	function newStepDynamic(step, index){

		$('#workStepList').append(getNewStepInput(step, index))

		$(`#step${index} input`).keyup(function(){
			if ($(this).val() != '' && !$(`#step${index + 1}`).length) {
				newStepDynamic('', index + 1)
			}else if ($(this).val() == '') {
				stepCleanUp(index)
			}
			checkNewWork()
		})
	}

	function stepCleanUp(step){
		if ($(`#step${step}`).val() == '' && $(`#step${step + 1}`).length) {
			if ($(`#step${step + 1} input`).val() != ''){
				$(`#step${step} input`).val($(`#step${step + 1} input`).val())
				$(`#step${step + 1} input`).val('')
				stepCleanUp(step + 1)
			}else{
				$(`#step${step + 1}`).remove()
			}				
		}
	}

	function checkNewWork(){
		var check = true
		if (newWork.title == 3) 				check = false
		if (newWork.img == '') 					check = false
		if (newWork.level == 0) 				check = false
		if (newWork.frq == 0) 					check = false
		if ($('.newStep input').length == 1) 	check = false

		if (check) {
			$('#saveWork').removeClass('w3-disabled')
			$('#createWork').removeClass('w3-disabled')
		}else{
			$('#saveWork').addClass('w3-disabled')
			$('#createWork').addClass('w3-disabled')
		}
		return check
	}

	$('#closeWorkForm').click(function(){
		if ($('#worksList').hasClass('w3-disabled')) {
			$('#workImg').css('max-width', '80%')
			$('#worksList').removeClass('w3-disabled')
			$('#newWork').removeClass('w3-disabled')
			$('#createWork').addClass('w3-disabled')
			$('#saveWork').addClass('w3-disabled')
			$('#imgList').addClass('w3-hide')
			$('#workTitle').html('')
			$('#workImg').attr('src', '')
			$('#workStepList').html('')
		}else{
			$('#workFormWindow').css('display', 'none')
		}
	})

	$('.removeWork').click(function(){
		

		var index = $(this).data('work')
		$(`#work${index}`).fadeOut()
		$(`#hrWork${index}`).fadeOut()
		//TODO: Réelement supprimer le Work
		tools[toolIndex].works.splice(index, 1)

	})

	$('.tool').click(function(e){
		console.log('tool')
		$('.tool').removeClass('decovi-blue')
		$(this).addClass('decovi-blue')
		toolIndex = $(this).data('index')
		ChargeContent()
		if (!modeEdition) {
			levelCheck()
		}else if ($(e.target).hasClass('openWorkForm')){
			openWorkForm()
		}
	})

	$('.levelSelect').click(function(){
		level = $(this).data('level')
		$('.levelSelect').removeClass('w3-white')
		$(this).addClass('w3-white')
		ChargeContent()
	})

	function ChargeContent(){
		$('#worksContent').html('')
		var tool = tools[toolIndex]
		tool.works.
			filter(w => w.level == level)
			.forEach((w, i) => {

				var frqStr = w.frq == 1 ? `Toute les semaines` : `Toute les ${w.frq} semaines`
				var work = `<hr id="hrWork${i}">
							<div id="work${i}" class="work w3-row w3-display-container">
								<img src="images/${w.img}" class="workImg w3-third w3-margin">
								<div class="w3-rest w3-margin">
									<span class="w3-large w3-center">
										${w.title}
										
									</span>
									<ol>
										${w.step.map(s => `<li>${s}</li>`).join('')}
									</ol>
								</div>
								<span class="w3-display-bottomright w3-margin w3-small w3-opacity">${frqStr}</span>
								<i class="notification fas fa-circle w3-display-topright w3-hide w3-padding decovi-blue-txt"></i>
							</div>`

				if (!modeEdition) {
					if (w.todo) {
						$('#worksContent').prepend(work)
						$(`#work${i} .notification`).removeClass('w3-hide')
					}else{
						$('#worksContent').append(work)
					}			
				}else{
					$('#worksContent').append(work)
					$(`#work${i} .removeWork`).removeClass('w3-hide')
				}
		})

		$('#worksContent').prepend(`
			<div id="titleContent" class="w3-xlarge w3-center w3-padding">
				-- ${tool.name} --
				<i id="printBtn" class="fas fa-print w3-xlarge w3-padding w3-right w3-hide"></i>
				<i id="doBtn" class="fas fa-check w3-xlarge w3-padding w3-right w3-hide"></i>
			</div>			
		`)

		if (!modeEdition) {
			$('#printBtn').removeClass('w3-hide')
			if (tool.works.filter(w => w.level == level).filter(w => w.todo).length > 0) {
				$('#doBtn').removeClass('w3-hide')			
			}
		}


		ChargeFollowedList()

		$('#printBtn').fadeIn()

		$('#printBtn').click(function() {
			//$(this).css('display', 'none')
			window.print()
		})

		$('#doBtn').click(function(){

			tools[toolIndex].works
				.filter(w => w.level == level)
				.forEach((w, i) => {
					w.todo = false
					$(`#work${i} i`).addClass('w3-hide')				
					//$(`#work${i} i`).addClass('fa-check')
			})

			toolsCheck()
			levelCheck()

			$(`#followedlist li.w3-large`).append('<i class="fas fa-check w3-large w3-right"></i>')

			$(this).addClass('w3-hide')
		})
		
	}


	$('#createWork').click(function(){

		if ($('#newWork').hasClass('w3-disabled') && checkNewWork()) {

			$('#newWork').removeClass('w3-disabled')
			$('#createWork').addClass('w3-disabled')
			$('#saveWork').addClass('w3-disabled')

			readStep()
			var clone = {
				id: 	works.length + 2, 
				title: 	newWork.title,
				level: 	newWork.level,
				img: 	newWork.img,
				step: 	newWork.step,
				frq: 	newWork.frq
			}
			works.push(clone)
			tools[toolIndex].works.push(clone)
			tools[toolIndex].worksId.push(clone.id)
			addWork(clone, 1)
			$(`#editWork${clone.id}`).addClass('decovi-blue')

			$('#worksList').removeClass('w3-disabled')			
			loadWorkList()
			loadWorkViewer(clone)
		}

	})

	$('#saveWork').click(function(){
		
		$('#newWork').removeClass('w3-disabled')
		$('#createWork').addClass('w3-disabled')
		$('#saveWork').addClass('w3-disabled')
		readStep()

		$('#worksList').removeClass('w3-disabled')
		loadWorkList()
		loadWorkViewer(newWork)
	})

	function readStep() {
		newWork.step = []
		$('.newStep').each(function(s) {
			var val = $(`#step${s} input`).val()
			if (val != '') newWork.step.push(val)
		})		
	}

})