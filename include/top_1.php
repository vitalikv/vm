



<noindex>
<div class="flex_1 top_panel_2">

	<? if($interface['mode_1'] == 1){ ?>
	<div class="tp_left_1">
		<div inf_type = 'mode_1' class="button1 button_gradient_1">Монтаж</div>
	</div>
	<? } ?>		
	
	<div class="toolbar" data-action ='top_panel_1'>
		
		<div class="button1-wrap-2" nameId='top_menu_b1' inf-visible='false' style="display: none;">			
		</div>
		
		<div class="button1-wrap-2" nameId='top_menu_b2' inf-visible='true'>
			<? if($interface['wall_1'] == 1){ ?>
			<div class="button1-wrap-1">
				<!--<div data-action ='wall' class="button1 button_gradient_1"><img src="/img/paint.png"></div>-->
				<div data-action ='wall' class="button1 button_gradient_1">Стена</div>
			</div>
			<? } ?>	

			<? if($interface['wd_2'] == 1){ ?>
			<div class="button1-wrap-1">
				<div data-action ='create_wd_2' class="button1 button_gradient_1">Дверь</div>
			</div>
			<? } ?>	
			<? if($interface['wd_3'] == 1){ ?>
			<div class="button1-wrap-1">
				<div data-action ='create_wd_3' class="button1 button_gradient_1">Окно</div>
			</div>
			<? } ?>			
		</div>	
	
		<? if($interface['wall_2']['top']['showHideWall_1'] == 1){ ?>
		<div class="button1 button_gradient_1" nameId='showHideWall_1' style="display: none;"> 
			Спрятать стены
		</div>		
		<? } ?>
		
		<? if($interface['estimate'] == 1){ ?>
		<div class="button1-wrap-1">
			<div data-action ='estimate' class="button1 button_gradient_1">СМЕТА</div>
		</div>
		<? } ?>
		<div class="button1-wrap-1">
			<div data-action ='screenshot' class="button1 button_gradient_1"><img src="<?=$path?>/img/screenshot.png"></div>
		</div>				
	</div> 
	
	<div class="tp_right_1">		
		<div infcam = '3D' class="button1 button_gradient_1">3D</div>			
	</div>
	
</div>
</noindex>

